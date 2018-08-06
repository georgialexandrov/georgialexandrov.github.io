---
layout: post
title:  "Jekyll and GitHub Pages"
date:   2018-07-29 15:27:04 +0300
tags: [jekyll, github-pages]
---

For many years I've been experimenting with all possible ways to host a website. 

I started in 2003 with free hosting supporting only html/css websites. Later on I tried Raspberry Pi next to my router, VPS, Cloud solutions and recently Intel NUC.

For years I was considering starting a blog and I started looking for a good solution. I wanted something simple, easy to configure, easy to support, stable and as safe from hackers as a modern web software can be.

I will write less than few posts per month so I don't need anything like wordpress. 

So the criteria was:

- does not need database servers;
- can generate static web pages;
- can be hosted for free somewhere with my doamin;

I was on my way to start node.js blog platform when I found [Jekyll](https://jekyllrb.com){:target="_blank"}. 

Jekyll is Ruby based solution for converting markdown files into static html pages and GitHub Pages is powered by it.

### How to host create a new website in GitHub Pages

First you need to create a new repository with name: `your-username.github.io` or in my case [georgialexandrov.github.io](http://github.com/georgialexandrov/georgialexandrov.github.io){:target="_blank"}

That's all you need to have github.io website. Even simple README.md is enough to have something online.

Adding custom domain is quite easy. Just push file with name `CNAME` to the repository. The content is just your website. For the current domain I have CNAME contains just single line line:

{% highlight text %}
georgialexandrov.eu
{% endhighlight %}

Alternative solution is to add your domain in repository settings:

![ScreenShot ](/assets/posts/img/github-custom-domain.png "GitHub Custom Domain")

Next you need to configure your A records with your DNS provider to point to GitHub Pages DNS IPs:

- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

For actual IPs better check [GitHub Help page](https://help.github.com/articles/setting-up-an-apex-domain/){:target="_blank"}  

The change may take up to 24 hours to take effect, but you can change your DNS to `1.1.1.1` to force the refresh.

