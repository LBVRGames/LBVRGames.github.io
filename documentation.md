---
layout: page
title: Documentation
---

Below you will find documentation related to LBVR game development with the Unreal Engine. If you have topics that you would like to see covered then get in [touch](mailto:tutorials@lbvrgames.com) with us.

{% assign tutorial_posts = site.categories["Tutorial"] %}
{% if tutorial_posts.size >= 1 %}
<h2> Tutorials </h2>
<ul>
    {% for post in tutorial_posts %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>
{% endif %}

{% assign how_to_posts = site.categories["How-to"] %}
{% if how_to_posts.size >= 1 %}
<h2> How-to guides </h2>
<ul>
    {% for post in how_to_posts %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>
{% endif %}

{% assign reference_posts = site.categories["Reference"] %}
{% if reference_posts.size >= 1 %}
<h2> Reference guides </h2>
<ul>
    {% for post in reference_posts %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>
{% endif %}

{% assign explanation_posts = site.categories["Explanation"] %}
{% if explanation_posts.size >= 1 %}
<h2> Explanation </h2>
<ul>
    {% for post in explanation_posts %}
        <li><a href="{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>
{% endif %}