---
layout: post
title: MikroTik automated configuration
date: 2018-08-04 23:58 +0300
---

This post will show configuration I tested on MikroTik hAP ac2, but all MikroTik routers are using RouterOS so there should be no difference.

![ScreenShot ](/assets/posts/img/hap-ac.png "MikroTik hAP ac 2")

Routers configuration is a boring task. Especially when you are trying to do something fast and stupid mistake leads to the need for hard reset.
Few monthes ago I made such mistake several times when I was trying to configure NAT rule on port 80. I had my domain pointing to my public IP which redirects the trafic to my Intel NUC.

It sounds easy until you redirect all your port 80 traffic to the machine in your local network.

Or you redirect port 80 from your router which blocks the access to the webfig configuration.

After each of this mistakes I needed to do hard reset and start from scratch the configuration for internet provider, wi-fi networks and NAT. That's why I decided to look for a way to automate the process. Luckily MikroTik gives you opportunity to configure everything through terminal.

There are two ways to do this:
* terminal in the webfig web interface
* ssh to router 

The webfig terminal does not allow you to copy or paste, so I prefer to ssh to router.

First I want to create a new user and disable the web configuration interface. Doing this even if someone manage to go through your wi-fi password (which is not that hard) she won't be able to redirect trafic, install malware or start mining.

I don't like passwords for ssh that's why I always use ssh keys to connect to remote servers. The first thing is to upload the public ssh key to the root directory of the router:
{% highlight bash %}
scp ~/.ssh/id_rsa.pub admin@192.168.88.1:/
{% endhighlight %}

By default the admin account have no password and you can login directly:
{% highlight bash %}
ssh admin@192.168.88.1
{% endhighlight %}

After the public ssh key is uploaded to the router I want to create a new user and import the ssh key into authorized_keys.
{% highlight bash %}
/user add name=[YOUR USERNAME] group=full comment="New administrative user" disabled=no  
/user ssh-keys import public-key-file=id_rsa.pub user=[YOUR USERNAME]
{% endhighlight %}

Now after I have a way to connect I want to disable the webfig configuration and admin user.
{% highlight bash %}
/ip service disable www
/ip service disable www-ssl
/user set [find name=admin] disabled=yes
{% endhighlight %}

Nothing is 100% secured in Internet, but with this steps we are one step better than we were with the default router settings.

The next step is to setup the Internet settings for the WAN port. In my case (the provider A1 in Bulgaria) I need to setup static IP, subnet mask, default gateway and DNS.

The provider gave me cheap TP-Link and assigned the mac address to my account so when I changed the router with my MikroTik I had 2 options:
* spend 15 minutes on the phone with the support;
* set the mac address of the old router to the new router;

I prefer the second option, but if don't need it just skip the first command

{% highlight bash %}
/interface ethernet set ether1 mac-address=[MAC ADDRESS FROM OLD ROUTER]

/ip address add address=[WAN IP]/[SUBNET MASK] interface=ether1

/ip route add gateway=[YOUR PROVIDER GATEWAY]

/ip dns set servers=[DNS SERVERS]
{% endhighlight %}

SUBNET MASK needs to be integer. If your provider gave you IP like 255.255.255.0 you can use [online calculator](http://www.subnet-calculator.com){:target="_blank"} to find out the integer value.
DNS SERVERS are comma separated list of IPs, e.g. `1.1.1.1,8.8.8.8`.

The Internet connection must be ok now, but by default MikroTik have two active Wi-Fi networks without password. In my case I want to keep the two networks:
* one for guests with simple to write password
* one "secured" with long random generated password

Each network needs security profile. I use wpa2-psk, but feel free to change it with whatever you think is better.
{% highlight bash %}
/interface wireless security-profiles add name=guests authentication-types=wpa2-psk mode=dynamic-keys wpa2-pre-shared-key=[GUEST PASSWORD]
/interface wireless security-profiles add name=[YOUR USERNAME] authentication-types=wpa2-psk mode=dynamic-keys wpa2-pre-shared-key=[STRONG PASSWORD]

/interface wireless set wlan1 ssid=[YOUR GUEST NETWORK SSID] security-profile=guests 
/interface wireless set wlan2 ssid=[YOUR MAIN NETWORK SSID] security-profile=[YOUR USERNAME] 
{% endhighlight %}

Now there are two wireless networks with different passwords, but they have the same access to the local network and this is not ok. I'll cover how to create two logical networks in part2 of this blogpost.

For now I'll cover just one more thing which is port redirection to machine in the local network.

If you want to keep webfig on and redirect domain on port 80 to local machine you won't be able to access the domain from the local network, because every domain pointing to port 80 will open the webfig configuration. One easy solution to this is to change the webfig port:
{% highlight bash %}
/ip service set www port=81
{% endhighlight %}

When redirecting something to machine in your local network you need to be sure this machine have the same IP always. DHCP lease can expire or the DHCP server can assign different IP after some of the hard resets.
{% highlight bash %}
/ip dhcp-server lease add address=[LOCAL IP] mac-address=[LOCAL IP MAC] comment="nuc"
{% endhighlight %}

After we are sure that the local machine always have static IP we can add the redirection rules
{% highlight bash %}
/ip firewall nat add chain=dstnat action=dst-nat to-addresses=[LOCAL IP] protocol=tcp in-interface=ether1 dst-port=[PORTS] log=no
/ip firewall nat add chain=dstnat action=dst-nat to-addresses=[LOCAL IP] protocol=udp in-interface=ether1 dst-port=[PORTS] log=no
{% endhighlight %}
* **NETWORK** by default is 192.168.88.0/24
* **PORTS** is comma separated list of ports to be opened, e.g. 21,22,80,443

Now when the router receives request on port 80 from the WAN interface the trafic will redirect it to the local machine on port 80.

But what will happen if we try to access the domain pointing to router from the local network? There is no rule for that so we need to add one:
{% highlight bash %}
/ip firewall nat add chain=dstnat action=dst-nat to-addresses=[LOCAL IP] protocol=tcp dst-address=[WAN IP] dst-port=[PORTS]
/ip firewall nat add chain=srcnat action=masquerade protocol=tcp src-address=[NETWORK] dst-address=[LOCAL IP] out-interface=bridge dst-port=[PORTS]
{% endhighlight %}

In part2 of this blogpost I'll cover how to add two logical networks for the two wi-fi networks. The goal is to allow your guest network only access to the Internet, but no access to the network where your TV, phone, laptop and other machines are.