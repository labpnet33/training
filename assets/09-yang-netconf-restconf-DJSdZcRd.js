var e={id:`yang-netconf-restconf`,h:{en:`YANG, NETCONF and RESTCONF on the 9800`,hi:`9800 par YANG, NETCONF aur RESTCONF`},body:{en:`
<p>When you order food in a restaurant you use a menu. The menu defines what exists and how it is described; the waiter carries your order to the kitchen. In network programmability the <b>menu</b> is a <b>YANG model</b>, and the <b>waiters</b> are protocols such as <b>NETCONF</b> and <b>RESTCONF</b>. The kitchen is the controller's configuration. This chapter is the hands-on core of the module (labs 1 and 2).</p>

<h3>YANG: the data model</h3>
<p><b>YANG</b> is a language that describes configuration and state data as a tree of containers, lists and leaves, with types and rules. A <b>module</b> is one YANG file. The 9800 wireless configuration lives in modules such as <code>Cisco-IOS-XE-wireless-wlan-cfg</code>, whose top container is <code>wlan-cfg-data</code>. A <b>list</b> has a <b>key</b> that picks one entry (here <code>profile-name</code>). A <b>leaf</b> is a single value such as <code>wlan-status</code>. Data marked <i>config true</i> is writable; operational (state) data is read-only and lives in separate <i>oper</i> modules.</p>
<p>Lab data model, a deliberate subset with simplified leaf names:</p>
<ul>
<li><code>Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=&lt;profile&gt;</code>: profile-name (key), wlan-id, ssid, wlan-status, broadcast-ssid, auth-key-mgmt-psk, auth-key-mgmt-dot1x. Writable: wlan-status and broadcast-ssid.</li>
<li><code>.../wlan-policies/wlan-policy=&lt;profile&gt;</code>: status, vlan, central-switching, description are writable.</li>
<li><code>Cisco-IOS-XE-native:native/hostname</code> (read) and <code>ietf-yang-library:modules-state</code> (module names).</li>
</ul>
<p>On a real 9800 you read the real model (a much larger leaf set) with a GET on <code>/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data</code>. Never copy the lab's leaf names into production scripts without checking.</p>

<h3>NETCONF and RESTCONF compared</h3>
<table class="cmp"><tr><th></th><th>NETCONF</th><th>RESTCONF</th></tr>
<tr><td>Transport</td><td>SSH, TCP 830</td><td>Secure web, TCP 443</td></tr>
<tr><td>Encoding</td><td>XML</td><td>JSON or XML (lab: JSON only)</td></tr>
<tr><td>Style</td><td>RPC operations (get, get-config, edit-config, commit)</td><td>REST verbs (GET, PATCH, PUT, POST, DELETE) on URIs</td></tr>
<tr><td>Standard</td><td>RFC 6241</td><td>RFC 8040</td></tr>
<tr><td>Switch on</td><td><code>netconf-yang</code></td><td><code>restconf</code> plus the secure web server</td></tr>
</table>

<h3>Switching it on (lab 1)</h3>
<pre class="code"><span class="c">! API administrator: privilege 15 is required</span>
username netops privilege 15 secret NkApi@2026
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf</pre>
<p>Web UI: <b>Administration &gt; Management &gt; H&#84;TP/H&#84;TPS Access Configuration</b> (secure server, authentication Local) and <b>Administration &gt; Management &gt; RESTCONF</b>. In this model the user is a CLI line. The API is served over TCP 443 only. Verify the services:</p>
<pre class="out">WLC1# show platform software yang-management process

confd            : Running
nesd             : Running
syncfd           : Running
ncsshd           : Not Running
dmiauthd         : Running
<span class="hl">nginx            : Running</span>
ndbmand          : Running
pubd             : Running
gnmib            : Running</pre>
<p><code>nginx</code> serves RESTCONF and needs both <code>restconf</code> and the secure server; <code>ncsshd</code> (NETCONF over SSH) runs only with <code>netconf-yang</code>; the others always run in the lab.</p>

<h3>Read a WLAN</h3>
<pre class="code"><span class="c">! from ADMIN1 (10.10.99.50)</span>
rest GET h&#116;tps://10.10.99.10/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF -u netops:NkApi@2026</pre>
<pre class="out">H&#84;TP/1.1 200 OK
Server: nginx
Content-Type: application/yang-data+json

{
  "Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry": {
    "profile-name": "NK-STAFF",
    <span class="hl">"wlan-id": 1,</span>
    "ssid": "NK-STAFF",
    "wlan-status": true,
    "broadcast-ssid": true,
    "auth-key-mgmt-psk": true,
    "auth-key-mgmt-dot1x": false
  }
}</pre>
<p>The lab asks for the <code>wlan-id</code>: 1. Note the module prefix in the first path node (<code>Cisco-IOS-XE-wireless-wlan-cfg:</code>); without it the answer is 400.</p>

<h3>Change a WLAN: PATCH</h3>
<pre class="code">rest PATCH h&#116;tps://10.10.99.10/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF -u netops:NkApi@2026 -H "Content-Type: application/yang-data+json" -d '{"Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry":{"profile-name":"NK-STAFF","wlan-status":true,"broadcast-ssid":false}}'</pre>
<pre class="out">H&#84;TP/1.1 204 No Content

WLC1# show running-config | section wlan NK-STAFF
wlan NK-STAFF 1 NK-STAFF
 <span class="hl">no broadcast-ssid</span>
 ...
 no shutdown</pre>
<p>Why include <code>wlan-status</code>? The controller translates a write into its own commands, so the CLI rule applies: an <b>enabled WLAN cannot be edited</b>. If you include <code>wlan-status</code> in the same PATCH, the model shuts the object, edits it, and restores the state you asked for. Without it, a PATCH of an enabled WLAN returns 409 and nothing changes. POST and DELETE return 405 (create and delete from the CLI), XML returns 406, and the entry key in the body must match the URI.</p>

<h3>NETCONF in the lab</h3>
<pre class="code">netconf 10.10.99.10 -u netops:NkApi@2026
get-config running
get running
close-session</pre>
<p>Port 830 is open only with <code>netconf-yang</code>, and login uses the same rules (privilege 15). Honest limits: the hello capability list is the shared lab list, not the real 9800 YANG library; filters work only for <code>/native/hostname</code>; <b>edit-config, the candidate datastore and WLAN subtree filters are concept only</b>. Use RESTCONF to change data in the lab.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="URI anatomy">
<rect x="10" y="20" width="620" height="44" rx="8" fill="#e2e8f0"/>
<text x="20" y="48" class="svg-ink" font-size="12">/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF</text>
<text x="20" y="95" class="svg-accent" font-size="12">/restconf/data : datastore root</text>
<text x="20" y="115" class="svg-accent" font-size="12">module-name:container : first node must carry the module prefix</text>
<text x="20" y="135" class="svg-accent" font-size="12">list=key : picks one entry (profile-name)</text>
</svg><p class="cap">A RESTCONF data URI: root, module-qualified container, then list and key.</p></div>

<div class="warn"><p><b>Common mistake.</b> Using a privileged account but forgetting the PATCH needs the Content-Type header and a body that names the same key as the URI. Another is turning on RESTCONF without the secure server: the service stays down because nginx needs both.</p></div>

<div class="exam"><p><b>Exam trap.</b> RESTCONF uses JSON or XML over the secure web server; NETCONF uses XML over SSH on TCP 830. RESTCONF PATCH merges; PUT replaces. A success from PATCH is 204 with no body.</p></div>

<div class="scn"><h4>The script that "worked" but changed nothing</h4><p>A script printed no error after a PATCH to hide an SSID, but the SSID was still visible. The script had caught the error and ignored the status code. The controller had answered 409 because the WLAN was enabled and the body had no wlan-status. The fix added wlan-status true to the body and a check that stops on any status other than 204.</p><p><b>Lesson:</b> always read the status code and read the value back.</p></div>

<div class="iv"><p class="q">"What is the difference between NETCONF and RESTCONF?"</p><p>Both expose YANG-modelled data. NETCONF is RPC over SSH on 830 with XML and datastores; RESTCONF maps the same models to REST verbs and URIs over the secure web server, usually with JSON. Add the 9800 specifics: privilege 15, secure server with local authentication, and the restconf and netconf-yang commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG describes data; NETCONF and RESTCONF are the protocols that carry it.</li>
<li>RESTCONF needs a privilege 15 user, secure server, local authentication and the restconf command.</li>
<li>The first path node must be module-qualified; the list key picks the entry.</li>
<li>An enabled WLAN or policy cannot be edited: include its status in the PATCH.</li>
<li>NETCONF edit-config and the candidate datastore are concept only in the lab.</li>
</ul></div>
`,hi:`
<p>Restaurant mein khana order karte waqt aap menu use karte ho. Menu batata hai ki kya hai aur uska description kaisa hai; waiter aapka order kitchen tak le jaata hai. Network programmability mein <b>menu</b> <b>YANG model</b> hai, aur <b>waiters</b> <b>NETCONF</b> aur <b>RESTCONF</b> jaise protocols hain. Kitchen controller ki configuration hai. Yeh chapter is module ka hands-on core hai (labs 1 aur 2).</p>

<h3>YANG: data model</h3>
<p><b>YANG</b> ek language hai jo configuration aur state data ko containers, lists aur leaves ke tree ki tarah, types aur rules ke saath describe karti hai. <b>Module</b> ek YANG file hai. 9800 wireless configuration <code>Cisco-IOS-XE-wireless-wlan-cfg</code> jaise modules mein hai, jiska top container <code>wlan-cfg-data</code> hai. <b>List</b> ki ek <b>key</b> hoti hai jo ek entry chunti hai (yahan <code>profile-name</code>). <b>Leaf</b> ek single value hai jaise <code>wlan-status</code>. <i>config true</i> data writable hota hai; operational (state) data read-only hai aur alag <i>oper</i> modules mein rehta hai.</p>
<p>Lab data model, jaan-boojhkar subset, simplified leaf names ke saath:</p>
<ul>
<li><code>Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=&lt;profile&gt;</code>: profile-name (key), wlan-id, ssid, wlan-status, broadcast-ssid, auth-key-mgmt-psk, auth-key-mgmt-dot1x. Writable: wlan-status aur broadcast-ssid.</li>
<li><code>.../wlan-policies/wlan-policy=&lt;profile&gt;</code>: status, vlan, central-switching, description writable hain.</li>
<li><code>Cisco-IOS-XE-native:native/hostname</code> (read) aur <code>ietf-yang-library:modules-state</code> (module names).</li>
</ul>
<p>Real 9800 par aap real model (bahut bada leaf set) <code>/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data</code> par GET se padhte ho. Lab ke leaf names bina check kiye production scripts mein copy mat karo.</p>

<h3>NETCONF aur RESTCONF ki tulna</h3>
<table class="cmp"><tr><th></th><th>NETCONF</th><th>RESTCONF</th></tr>
<tr><td>Transport</td><td>SSH, TCP 830</td><td>Secure web, TCP 443</td></tr>
<tr><td>Encoding</td><td>XML</td><td>JSON ya XML (lab: sirf JSON)</td></tr>
<tr><td>Style</td><td>RPC operations (get, get-config, edit-config, commit)</td><td>URIs par REST verbs (GET, PATCH, PUT, POST, DELETE)</td></tr>
<tr><td>Standard</td><td>RFC 6241</td><td>RFC 8040</td></tr>
<tr><td>On karo</td><td><code>netconf-yang</code></td><td><code>restconf</code> plus secure web server</td></tr>
</table>

<h3>On karna (lab 1)</h3>
<pre class="code"><span class="c">! API administrator: privilege 15 zaroori hai</span>
username netops privilege 15 secret NkApi@2026
ip h&#116;tp secure-server
ip h&#116;tp authentication local
restconf</pre>
<p>Web UI: <b>Administration &gt; Management &gt; H&#84;TP/H&#84;TPS Access Configuration</b> (secure server, authentication Local) aur <b>Administration &gt; Management &gt; RESTCONF</b>. Is model mein user CLI line hai. API sirf TCP 443 par serve hoti hai. Services verify karo:</p>
<pre class="out">WLC1# show platform software yang-management process

confd            : Running
nesd             : Running
syncfd           : Running
ncsshd           : Not Running
dmiauthd         : Running
<span class="hl">nginx            : Running</span>
ndbmand          : Running
pubd             : Running
gnmib            : Running</pre>
<p><code>nginx</code> RESTCONF serve karta hai aur use <code>restconf</code> aur secure server dono chahiye; <code>ncsshd</code> (SSH par NETCONF) sirf <code>netconf-yang</code> ke saath chalta hai; baaki lab mein hamesha chalte hain.</p>

<h3>WLAN padho</h3>
<pre class="code"><span class="c">! ADMIN1 (10.10.99.50) se</span>
rest GET h&#116;tps://10.10.99.10/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF -u netops:NkApi@2026</pre>
<pre class="out">H&#84;TP/1.1 200 OK
Server: nginx
Content-Type: application/yang-data+json

{
  "Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry": {
    "profile-name": "NK-STAFF",
    <span class="hl">"wlan-id": 1,</span>
    "ssid": "NK-STAFF",
    "wlan-status": true,
    "broadcast-ssid": true,
    "auth-key-mgmt-psk": true,
    "auth-key-mgmt-dot1x": false
  }
}</pre>
<p>Lab <code>wlan-id</code> poochhta hai: 1. Pehle path node mein module prefix (<code>Cisco-IOS-XE-wireless-wlan-cfg:</code>) dhyan se dekho; uske bina jawab 400 hai.</p>

<h3>WLAN badlo: PATCH</h3>
<pre class="code">rest PATCH h&#116;tps://10.10.99.10/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF -u netops:NkApi@2026 -H "Content-Type: application/yang-data+json" -d '{"Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-entry":{"profile-name":"NK-STAFF","wlan-status":true,"broadcast-ssid":false}}'</pre>
<pre class="out">H&#84;TP/1.1 204 No Content

WLC1# show running-config | section wlan NK-STAFF
wlan NK-STAFF 1 NK-STAFF
 <span class="hl">no broadcast-ssid</span>
 ...
 no shutdown</pre>
<p><code>wlan-status</code> kyun daalte hain? Controller write ko apne commands mein translate karta hai, isliye CLI rule lagta hai: <b>enabled WLAN edit nahi ho sakta</b>. Agar aap usi PATCH mein <code>wlan-status</code> daalo, to model object ko shut karta hai, edit karta hai, aur aapki maangi state wapas karta hai. Uske bina enabled WLAN ka PATCH 409 deta hai aur kuch nahi badalta. POST aur DELETE 405 dete hain (create aur delete CLI se), XML 406 deta hai, aur body ki entry key URI se match karni chahiye.</p>

<h3>Lab mein NETCONF</h3>
<pre class="code">netconf 10.10.99.10 -u netops:NkApi@2026
get-config running
get running
close-session</pre>
<p>Port 830 sirf <code>netconf-yang</code> ke saath khula hai, aur login wahi rules (privilege 15). Honest limits: hello capability list shared lab list hai, real 9800 YANG library nahi; filters sirf <code>/native/hostname</code> ke liye chalte hain; <b>edit-config, candidate datastore aur WLAN subtree filters sirf concept hain</b>. Lab mein data badalne ke liye RESTCONF use karo.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="URI anatomy">
<rect x="10" y="20" width="620" height="44" rx="8" fill="#e2e8f0"/>
<text x="20" y="48" class="svg-ink" font-size="12">/restconf/data/Cisco-IOS-XE-wireless-wlan-cfg:wlan-cfg-data/wlan-cfg-entries/wlan-cfg-entry=NK-STAFF</text>
<text x="20" y="95" class="svg-accent" font-size="12">/restconf/data : datastore root</text>
<text x="20" y="115" class="svg-accent" font-size="12">module-name:container : pehle node par module prefix zaroori</text>
<text x="20" y="135" class="svg-accent" font-size="12">list=key : ek entry chunta hai (profile-name)</text>
</svg><p class="cap">RESTCONF data URI: root, module-qualified container, phir list aur key.</p></div>

<div class="warn"><p><b>Common mistake.</b> Privileged account use karna lekin yeh bhool jaana ki PATCH ko Content-Type header aur aisi body chahiye jo URI jaisi hi key naam kare. Doosri galti secure server ke bina RESTCONF on karna: service down rehti hai kyunki nginx ko dono chahiye.</p></div>

<div class="exam"><p><b>Exam trap.</b> RESTCONF secure web server par JSON ya XML use karta hai; NETCONF TCP 830 par SSH ke upar XML. RESTCONF PATCH merge karta hai; PUT replace karta hai. PATCH ka success 204 hai bina body ke.</p></div>

<div class="scn"><h4>Script jo "chali" lekin kuch nahi badla</h4><p>Ek script ne SSID hide karne ke PATCH ke baad koi error print nahi kiya, lekin SSID abhi bhi dikh raha tha. Script ne error pakad kar status code ignore kar diya tha. Controller ne 409 diya tha kyunki WLAN enabled tha aur body mein wlan-status nahi tha. Fix mein body mein wlan-status true joda gaya aur 204 ke alawa kisi bhi status par rukne wala check lagaya gaya.</p><p><b>Lesson:</b> hamesha status code padho aur value wapas padho.</p></div>

<div class="iv"><p class="q">"NETCONF aur RESTCONF mein kya farq hai?"</p><p>Dono YANG-modelled data expose karte hain. NETCONF 830 par SSH ke upar RPC hai, XML aur datastores ke saath; RESTCONF wahi models REST verbs aur URIs par secure web server se map karta hai, aam taur par JSON mein. 9800 specifics jodo: privilege 15, local authentication wala secure server, aur restconf aur netconf-yang commands.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG data describe karta hai; NETCONF aur RESTCONF use le jaane wale protocols hain.</li>
<li>RESTCONF ko privilege 15 user, secure server, local authentication aur restconf command chahiye.</li>
<li>Pehla path node module-qualified ho; list key entry chunti hai.</li>
<li>Enabled WLAN ya policy edit nahi hoti: PATCH mein uska status daalo.</li>
<li>NETCONF edit-config aur candidate datastore lab mein sirf concept hain.</li>
</ul></div>
`}};export{e as default};