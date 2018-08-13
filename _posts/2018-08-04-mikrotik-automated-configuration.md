---
layout: post
title: MikroTik automated configuration
date: 2018-08-04 23:58 +0300
tags: [mikrotik, automation]
---

This post is showing configuration I use on MikroTik hAP ac2, but all MikroTik routers are using RouterOS so there should be no difference.

![ScreenShot ](/assets/posts/img/hap-ac.png "MikroTik hAP ac 2")

For me, router configuration is a boring task. Especially when I am trying to do something fast and stupid mistake leads to the need for a hard reset.
A few months ago I made such mistake several times when I was trying to configure NAT rule on port 80. I had my domain pointing to my public IP which redirects the traffic to my [Intel NUC](https://en.wikipedia.org/wiki/Next_Unit_of_Computing){:target="_blank"}.

I thought it is quite easy until I ended up redirecting all my traffic with destination port 80 to the NUC in my local network.

I did the hard reset, configured everything, started from scratch with the NAT rules made again all new settings and this time I was able to access my domain and everything was working fine ... except for the traffic to 80 to the router which was pointing to the NUC by which I blocked my access to the router web configuration.

Since I was having VLANs on my list to experiment I decided to do something to speed up the configuration after hard reset which requires everything from the configuration for the Internet provider, wi-fi networks, passwords to the NAT, custom DHCP binding and more. I knew MikroTik allows configuration through a terminal and that's one of the reasons I bought it, but I never found time to dig into that.

There are two ways to execute commands on MikroTik router:
* terminal in the web interface (webfig);
* ssh to the router;

The webfig terminal does not allow copying and pasting, but that's not the only reason I prefer to ssh to the router. After all my idea is to just run a script, wait for a couple of seconds and have the entire configuration set up.

I also wanted to disable the web configuration interface at least for the guest wi-fi network for security reasons.

## Configuration time!

RouterOS is Linux and allows using SSH keys for authentication. The first thing I wanted to do is to upload the public ssh key to the root directory of the router and luckily I can use [scp](https://www.freebsd.org/cgi/man.cgi?query=scp&sektion=1){:target="_blank"}:
{% highlight bash %}
scp ~/.ssh/id_rsa.pub admin@192.168.88.1:/
{% endhighlight %}

By default, the admin account have no password and the ssh port is open, so connecting as admin is just:
{% highlight bash %}
ssh admin@192.168.88.1
{% endhighlight %}

After the public ssh key is uploaded to the router I want to create a new user and import the ssh key into new user's authorized_keys.
{% highlight bash %}
/user add name=[NEW USERNAME] group=full comment="New administrative user" disabled=no  
/user ssh-keys import public-key-file=id_rsa.pub user=[NEW USERNAME]
{% endhighlight %}

Now after I have a way to connect I want to disable the webfig configuration and admin user.
{% highlight bash %}
/ip service disable www
/ip service disable www-ssl
/user set [find name=admin] disabled=yes
{% endhighlight %}

Nothing is 100% secured on the Internet, but with this steps, I am way better than the default router settings.

The next step is to set up the Internet settings for the WAN port. In my case (the provider A1 in Bulgaria) I need to set static IP, subnet mask, default gateway and DNS.

The provider gave me cheap TP-Link when I signed the contract and assigned the MAC address to my account so when I changed the router with my MikroTik I had 2 options:
* spend 15 minutes on the phone with the support;
* set the mac address of the old router to the new router;

I prefer the second option:
{% highlight bash %}
/interface ethernet set ether1 mac-address=[MAC ADDRESS FROM OLD ROUTER]
{% endhighlight %}

Now I only need to set the IPs and I'll be able to connect:
{% highlight bash %}
/ip address add address=[WAN IP]/[SUBNET MASK] interface=ether1
/ip route add gateway=[PROVIDER GATEWAY]
/ip dns set servers=[DNS SERVERS]
{% endhighlight %}

*SUBNET MASK needs to be an integer. If your provider gave you IP like 255.255.255.0 you can use [online calculator](http://www.subnet-calculator.com){:target="_blank"} to find out the integer value.*

*DNS SERVERS is comma separated list of IPs, e.g. `1.1.1.1,8.8.8.8`.*

The Internet connection is ok now, but by default, MikroTik has two active Wi-Fi networks without a password. In my case I want to keep the two networks:
* one for guests with simple to remember and write password;
* one "secured" with a long random generated password;

Each network first needs security profile. I use wpa2-psk:
{% highlight bash %}
/interface wireless security-profiles add name=guests authentication-types=wpa2-psk mode=dynamic-keys wpa2-pre-shared-key=[GUEST PASSWORD]
/interface wireless security-profiles add name=[USERNAME] authentication-types=wpa2-psk mode=dynamic-keys wpa2-pre-shared-key=[STRONG PASSWORD]

/interface wireless set wlan1 ssid=[GUEST NETWORK SSID] security-profile=guests 
/interface wireless set wlan2 ssid=[MAIN NETWORK SSID] security-profile=[USERNAME] 
{% endhighlight %}

Now I have Internet and secured wi-fi networks, but I wanted to access the web configuration for easier overview of the configuration during the NAT setup. If I enable webfig and redirect my domain on port 80 to the local machine I won't be able to access the domain from the local network, because every domain pointing to port 80 will open the webfig configuration. One easy solution to this is to change the webfig port:
{% highlight bash %}
/ip service set www port=81
{% endhighlight %}

Redirecting traffic to the machine in the local network is done through IP, so I need to be sure this machine has always the same IP. DHCP lease can expire or the DHCP server can assign different IP after one of the hard resets.
{% highlight bash %}
/ip dhcp-server lease add address=[NUC IP] mac-address=[NUC MAC] comment="nuc"
{% endhighlight %}

Now after the local machine have static IP it's time for the redirection rules
{% highlight bash %}
/ip firewall nat add chain=dstnat action=dst-nat to-addresses=[LOCAL IP] protocol=tcp in-interface=ether1 dst-port=[PORTS] log=no
/ip firewall nat add chain=dstnat action=dst-nat to-addresses=[LOCAL IP] protocol=udp in-interface=ether1 dst-port=[PORTS] log=no
{% endhighlight %}
* **NETWORK** by default is 192.168.88.0/24
* **PORTS** is comma separated list of ports to be opened, e.g. 21,22,80,443

All good! When the router receives request on port 80 from the WAN interface the traffic will redirect it to the local machine on port 80, but what will happen if I try to access the domain pointing to router from the local network? There is no rule for that so I needed to add one:
{% highlight bash %}
/ip firewall nat add chain=dstnat action=dst-nat to-addresses=[LOCAL IP] protocol=tcp dst-address=[WAN IP] dst-port=[PORTS]
/ip firewall nat add chain=srcnat action=masquerade protocol=tcp src-address=[NETWORK] dst-address=[LOCAL IP] out-interface=bridge dst-port=[PORTS]
{% endhighlight %}

The goal is achieved. I have automated configuration and router setup takes about 1 second. I added everything in a script with placeholders in my [GitHub account](https://github.com/georgialexandrov/dotfiles/blob/master/router_configuration){:target="_blank"}.

For easy execution I wrote simple node.js script for replacing the placeholders with values from JSON file I keep stored in private repo and cloned in `~/.config/dotfiles`.
{% highlight js %}
const fs = require('fs');
let arg = process.argv[2];

const config = require(`${process.env.HOME}/.config/dotfiles/config.json`)

var data = fs.readFileSync(`./${arg}`,"utf8");
console.log(eval('`'+data+'`'))
{% endhighlight %}

The complete (at least for the routed) `config.json` looks like this:
{% highlight json %}
{
    "mikrotik": {
        "webfig_port": 81,
        "mac_address": "AA-BB-CC-DD-EE-FF",
        "ip_address": "111.111.111.111",
        "subnet_mask": 26,
        "wan_interface": "ether1",
        "gateway": "111.111.111.111",
        "dns_servers": "1.1.1.1,8.8.8.8",
        "nat_destination_ip": "192.168.88.2",
        "tcp_nat": [22, 80, 443],
        "udp_nat": [1194],
        "default_username": "admin",
        "default_ip": "192.168.88.1",
        "main_wifi": {
            "ssid": "SECURED NETWORK",
            "security_profile": "secured-profile",
            "password": "abcd...(kidding,should-be-more-secure)"
        },
        "guest_wifi": {
            "ssid": "GUEST NETWORK",
            "security_profile": "guest",
            "password": "kittens"
        },
        "dhcp_static": [
            {
                "ip": "192.168.88.2",
                "mac": "BB:CC:DD:EE:FF:GG",
                "comment": "nuc"
            }
        ]
    }
}
{% endhighlight %}

Now I simply run:
{% highlight bash %}
node replacer.js router_configuration | bash
{% endhighlight %}

Works fine. Almost. There are two wireless networks with different passwords, but they have the same access to the local network and this is not ok. I'll cover how to create two logical networks in part2 of this blog post.
