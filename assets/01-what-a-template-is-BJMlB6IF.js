var e={id:`what-a-template-is`,h:{en:`What a template is and what lives in it`,hi:`Template kya hai aur usme kya rehta hai`},body:{en:`
<p>Think of a school that opens ten branches. The head office does not phone each principal to say which uniform, which timetable and which bell schedule to use. It prints one rule book and posts a copy to every branch. A Panorama <b>template</b> is that rule book, but for firewalls: a named bundle of settings that Panorama keeps in one place and sends to many managed firewalls.</p>

<h3>Two kinds of configuration</h3>
<p>A firewall's configuration has two big halves. The first half says <b>how the box is wired and how it behaves as a device</b>: interfaces, IP addresses, zones, the virtual router and its routes, management profiles, DNS and NTP settings, server profiles such as syslog. This is <b>network and device configuration</b>, and it belongs in a template. The second half says <b>what traffic is allowed</b>: security rules, NAT rules, address and service objects, log forwarding profiles. This is <b>policy and objects</b>, and it belongs in a device group. Panorama keeps these two halves apart on purpose, and this module is only about the first half. Device groups come in the next module.</p>
<table class="tbl"><thead><tr><th>Question</th><th>Answer lives in</th><th>Example</th></tr></thead><tbody>
<tr><td>What IP does ethernet1/1 have?</td><td>Template</td><td>ip 203.0.113.2/30</td></tr>
<tr><td>Which zone is ethernet1/2 in?</td><td>Template</td><td>zone trust</td></tr>
<tr><td>Where does the default route go?</td><td>Template</td><td>next hop 203.0.113.1</td></tr>
<tr><td>May the LAN browse the web?</td><td>Device group</td><td>security rule Allow-Out</td></tr>
<tr><td>Which servers receive syslog?</td><td>Template (server profile)</td><td>syslog profile</td></tr>
</tbody></table>

<h3>Seeing it in the lab</h3>
<p>In the lab for this module a template called <code>NK-BRANCH-NET</code> already exists. You can list it from Panorama and see the variables it expects.</p>
<pre class="code">PANO&gt; show templates

Template NK-BRANCH-NET:
    Description: 
    Variables: $wan-ip, $lan-ip, $wan-gw</pre>
<p>Inside the template are interfaces, two zones (untrust and trust), a virtual router with a default route, and two interface management profiles. Notice that the template does not contain a single hard-coded WAN address. It contains <b>placeholders</b> written with a dollar sign. Chapter 5 explains them fully; for now remember that a template describes the <i>shape</i> of a branch and leaves the site-specific facts to be filled in.</p>

<h3>Template versus firewall, the honest boundary</h3>
<p>The simulator flattens a real feature. In a real product a template can contain several virtual systems, and zones sit under a vsys. In the lab, zones sit directly under <code>config</code>. Everything in the lab is a learning model, so check the documentation for your PAN-OS version for exact details.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator): idea of a template</span>
template NK-BRANCH-NET
  network interface ethernet ethernet1/1 layer3 ip $wan-ip
  network interface ethernet ethernet1/2 layer3 ip $lan-ip
  zone untrust network layer3 ethernet1/1
  zone trust   network layer3 ethernet1/2
  virtual-router default routing-table ip static-route default nexthop $wan-gw</pre>

<div class="scn"><h4>Rule book, not remote control</h4><p>A new engineer asks why he cannot just log in to Pune and type the interface address there. He can, but the next push from Panorama will carry the template's idea of that address, and the two will fight. The team's habit is simple: if a setting is part of the branch standard, it is changed in the template, once, and then pushed. A local change is only for something a template cannot express.</p></div>

<div class="iv"><p class="q">"What is a template in Panorama and what is it not?"</p><p>A template holds network and device configuration such as interfaces, zones, routing, management profiles and server profiles, and Panorama pushes it to managed firewalls. It does not hold security policy or objects; those live in device groups.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A template is a named bundle of network and device settings kept on Panorama.</li>
<li>Interfaces, zones, routes and server profiles go in templates; rules and objects go in device groups.</li>
<li>Templates use $variables so one design can serve many sites.</li>
<li>The lab template NK-BRANCH-NET expects $wan-ip, $lan-ip and $wan-gw.</li>
<li>The simulator flattens vsys; check the documentation for your PAN-OS version.</li>
</ul></div>
`,hi:`
<p>Socho ek school ke das branches hain. Head office har principal ko phone karke nahi batata ki kaunsi uniform, kaunsa timetable aur kaunsi bell schedule chalani hai. Wo ek rule book print karta hai aur har branch ko copy bhej deta hai. Panorama ka <b>template</b> firewalls ke liye wahi rule book hai: settings ka ek named bundle jo Panorama ek jagah rakhta hai aur bahut saare managed firewalls ko bhejta hai.</p>

<h3>Configuration ke do kism</h3>
<p>Firewall ki configuration ke do bade hisse hain. Pehla hissa batata hai ki <b>box kaise wired hai aur device ki tarah kaise behave karta hai</b>: interfaces, IP addresses, zones, virtual router aur uske routes, management profiles, DNS aur NTP settings, syslog jaise server profiles. Ye <b>network aur device configuration</b> hai, aur ye template mein jaati hai. Doosra hissa batata hai ki <b>kaunsa traffic allowed hai</b>: security rules, NAT rules, address aur service objects, log forwarding profiles. Ye <b>policy aur objects</b> hain, aur ye device group mein jaate hain. Panorama in dono hisson ko jaan-boojh kar alag rakhta hai, aur ye module sirf pehle hisse ke baare mein hai. Device groups agle module mein aayenge.</p>
<table class="tbl"><thead><tr><th>Sawal</th><th>Jawab kahan rehta hai</th><th>Example</th></tr></thead><tbody>
<tr><td>ethernet1/1 ka IP kya hai?</td><td>Template</td><td>ip 203.0.113.2/30</td></tr>
<tr><td>ethernet1/2 kaunse zone mein hai?</td><td>Template</td><td>zone trust</td></tr>
<tr><td>Default route kahan jaata hai?</td><td>Template</td><td>next hop 203.0.113.1</td></tr>
<tr><td>Kya LAN web browse kar sakta hai?</td><td>Device group</td><td>security rule Allow-Out</td></tr>
<tr><td>Syslog kin servers ko jaata hai?</td><td>Template (server profile)</td><td>syslog profile</td></tr>
</tbody></table>

<h3>Lab mein dekhna</h3>
<p>Is module ke lab mein <code>NK-BRANCH-NET</code> naam ka template pehle se hai. Panorama se list karo aur dekho ki wo kaunse variables expect karta hai.</p>
<pre class="code">PANO&gt; show templates

Template NK-BRANCH-NET:
    Description: 
    Variables: $wan-ip, $lan-ip, $wan-gw</pre>
<p>Template ke andar interfaces, do zones (untrust aur trust), default route wala virtual router aur do interface management profiles hain. Dhyan do ki template mein ek bhi hard-coded WAN address nahi hai. Usme dollar sign wale <b>placeholders</b> hain. Chapter 5 inhe poori tarah samjhata hai; abhi bas yaad rakho ki template branch ki <i>shape</i> batata hai aur site-specific facts bharne ke liye chhod deta hai.</p>

<h3>Template versus firewall, honest boundary</h3>
<p>Simulator ek real feature ko flatten karta hai. Real product mein template mein kai virtual systems ho sakte hain aur zones vsys ke neeche hote hain. Lab mein zones seedha <code>config</code> ke neeche hain. Lab sab learning model hai, isliye exact details ke liye apne PAN-OS version ki documentation check karo.</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator): template ka idea</span>
template NK-BRANCH-NET
  network interface ethernet ethernet1/1 layer3 ip $wan-ip
  network interface ethernet ethernet1/2 layer3 ip $lan-ip
  zone untrust network layer3 ethernet1/1
  zone trust   network layer3 ethernet1/2
  virtual-router default routing-table ip static-route default nexthop $wan-gw</pre>

<div class="scn"><h4>Rule book, remote control nahi</h4><p>Ek naya engineer puchta hai ki Pune mein login karke seedha interface address kyun nahi type kar sakta. Kar sakta hai, lekin Panorama ka agla push template ka address leke aayega aur dono ladenge. Team ki aadat simple hai: setting branch standard ka hissa hai to template mein ek baar badlo aur push karo. Local change sirf wahi cheez ke liye jo template express nahi kar sakta.</p></div>

<div class="iv"><p class="q">"Panorama mein template kya hai aur kya nahi hai?"</p><p>Template mein network aur device configuration hoti hai jaise interfaces, zones, routing, management profiles aur server profiles, aur Panorama use managed firewalls ko push karta hai. Usme security policy ya objects nahi hote; wo device groups mein rehte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Template Panorama par rakha network aur device settings ka named bundle hai.</li>
<li>Interfaces, zones, routes aur server profiles template mein; rules aur objects device group mein.</li>
<li>Templates $variables use karte hain taaki ek design bahut sites ko serve kare.</li>
<li>Lab template NK-BRANCH-NET $wan-ip, $lan-ip aur $wan-gw expect karta hai.</li>
<li>Simulator vsys ko flatten karta hai; apne PAN-OS version ki documentation check karo.</li>
</ul></div>
`}};export{e as default};