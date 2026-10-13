var e={id:`config-xpaths`,h:{en:`The configuration tree: XPath, get and show, set, edit and delete`,hi:`Configuration tree: XPath, get aur show, set, edit aur delete`},body:{en:`
<p>The firewall configuration is a big filing cabinet. A folder is a tag, a drawer label is <code>entry[@name='...']</code>, and an <b>XPath</b> is the route to one drawer. Once you can write the route, the five actions of <code>type=config</code> are easy: <code>get</code> and <code>show</code> read, <code>set</code> and <code>edit</code> write, <code>delete</code> removes.</p>

<div class="dia"><svg viewBox="0 0 640 212" role="img" aria-label="diagram">
<rect x="8" y="10" width="110" height="34" rx="10" fill="#ddd6fe"/><text x="63" y="32" text-anchor="middle" class="svg-ink" font-size="13">/config</text>
<rect x="8" y="60" width="110" height="34" rx="10" fill="#ddd6fe"/><text x="63" y="82" text-anchor="middle" class="svg-ink" font-size="13">devices</text>
<rect x="8" y="110" width="150" height="34" rx="10" fill="#ddd6fe"/><text x="83" y="132" text-anchor="middle" class="svg-ink" font-size="11">entry localhost.localdomain</text>
<rect x="190" y="110" width="90" height="34" rx="10" fill="#ddd6fe"/><text x="235" y="132" text-anchor="middle" class="svg-ink" font-size="13">vsys</text>
<rect x="300" y="110" width="90" height="34" rx="10" fill="#ddd6fe"/><text x="345" y="132" text-anchor="middle" class="svg-ink" font-size="12">entry vsys1</text>
<rect x="410" y="60" width="100" height="34" rx="10" fill="#fde68a"/><text x="460" y="82" text-anchor="middle" class="svg-ink" font-size="13">address</text>
<rect x="410" y="110" width="100" height="34" rx="10" fill="#fde68a"/><text x="460" y="132" text-anchor="middle" class="svg-ink" font-size="13">address-group</text>
<rect x="410" y="160" width="100" height="34" rx="10" fill="#fde68a"/><text x="460" y="182" text-anchor="middle" class="svg-ink" font-size="13">rulebase</text>
<rect x="530" y="60" width="100" height="34" rx="10" fill="#bbf7d0"/><text x="580" y="82" text-anchor="middle" class="svg-ink" font-size="12">entry web-srv</text>
<rect x="530" y="160" width="100" height="34" rx="10" fill="#bbf7d0"/><text x="580" y="182" text-anchor="middle" class="svg-ink" font-size="12">security/rules</text>
<line x1="63" y1="44" x2="63" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="63" y1="94" x2="63" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="158" y1="127" x2="190" y2="127" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="127" x2="300" y2="127" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="120" x2="410" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="127" x2="410" y2="127" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="134" x2="410" y2="177" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="77" x2="530" y2="77" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="177" x2="530" y2="177" stroke="#64748b" stroke-width="2"/>
<text x="220" y="40" text-anchor="start" class="svg-ink" font-size="13">get  = read the candidate</text>
<text x="220" y="60" text-anchor="start" class="svg-ink" font-size="13">show = read the running config</text>
</svg><p class="cap">An XPath is a path down this tree. Objects live under vsys, in entries named by their name.</p></div>

<h3>The route to an object</h3>
<p>Objects, rules and zones of a virtual system live under <code>vsys</code>. Interfaces and system settings live one level higher, under <code>devices/entry</code>. This firewall has one device, <code>localhost.localdomain</code>, and one vsys, <code>vsys1</code>, which is why <code>panconf.py</code> holds the prefix once:</p>
<pre class="code">VSYS = "/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']"
VSYS + "/address/entry[@name='web-srv']"
VSYS + "/rulebase/security/rules/entry[@name='allow-web']"</pre>
<p>Lists of values, such as the zones or addresses of a rule, are written as repeated <code>&lt;member&gt;</code> tags. A single value, like <code>&lt;action&gt;allow&lt;/action&gt;</code>, is a plain tag.</p>

<h3>The five actions</h3>
<table class="cmp"><tr><th>Action</th><th>Does</th><th>Element</th></tr>
<tr><td><code>get</code></td><td>Reads the <b>candidate</b> configuration</td><td>none</td></tr>
<tr><td><code>show</code></td><td>Reads the <b>running</b> configuration</td><td>none</td></tr>
<tr><td><code>set</code></td><td>Creates the node or <b>merges</b> into it</td><td>the children of the node</td></tr>
<tr><td><code>edit</code></td><td><b>Replaces</b> the whole node</td><td>the whole node, including the <code>entry</code></td></tr>
<tr><td><code>delete</code></td><td>Removes the node</td><td>none</td></tr></table>
<p>Also available: <code>rename</code>, <code>move</code> (rule order) and <code>clone</code>. The pair that trips people up is <code>get</code> and <code>show</code>: two spellings that differ by one word and by one whole configuration.</p>

<h3>Candidate versus running, live</h3>
<p>This is the second half of Lab 1 task 2. <code>candidate.py</code> sets an address and reads the same path with both actions.</p>
<pre class="code">from panconf import VSYS
from xapi import call

call(type="config", action="set", xpath=VSYS + "/address/entry[@name='web-srv']",
     element="&lt;ip-netmask&gt;10.20.0.10/32&lt;/ip-netmask&gt;&lt;description&gt;Web server&lt;/description&gt;")
for action in ("get", "show"):
    reply = call(type="config", action=action, xpath=VSYS + "/address")
    print("%-5s %s" % (action, [e.get("name") for e in reply.findall(".//entry")]))</pre>
<pre class="out">AUTO01$ python3 candidate.py
get   ['web-srv']
<span class="hl">show  []</span></pre>
<p>The candidate already has <code>web-srv</code>; the running configuration does not, because nothing has been committed. An empty list here is code 7, a success with no data. (The next chapter commits it.) If you want to know what a commit would publish, compare the two reads.</p>

<h3>Merge or replace: set against edit</h3>
<p><code>cfgdemo.py</code> shows the difference that causes the most damage in real life, then shows what the firewall says when you delete something that is still in use.</p>
<pre class="code">print("two sets (merge):", entry().findtext("ip-netmask"), "|", entry().findtext("description"))

call(type="config", action="edit", xpath=ADDR % "app1",
     element='&lt;entry name="app1"&gt;&lt;ip-netmask&gt;10.20.0.22/32&lt;/ip-netmask&gt;&lt;/entry&gt;')
print("one edit (replace):", entry().findtext("ip-netmask"), "|", entry().findtext("description"))

call(type="config", action="set", xpath=RULE % "app-in",
     element="&lt;from&gt;&lt;member&gt;trust&lt;/member&gt;&lt;/from&gt;&lt;to&gt;&lt;member&gt;dmz&lt;/member&gt;&lt;/to&gt;&lt;source&gt;&lt;member&gt;any&lt;/member&gt;&lt;/source&gt;"
             "&lt;destination&gt;&lt;member&gt;app1&lt;/member&gt;&lt;/destination&gt;&lt;application&gt;&lt;member&gt;any&lt;/member&gt;&lt;/application&gt;"
             "&lt;service&gt;&lt;member&gt;application-default&lt;/member&gt;&lt;/service&gt;&lt;action&gt;allow&lt;/action&gt;")
for what, path in (("address app1", ADDR % "app1"), ("rule app-in", RULE % "app-in"), ("address app1", ADDR % "app1")):
    try:
        call(type="config", action="delete", xpath=path)
        print("delete %-12s ok" % what)
    except PanApiError as err:
        print("delete %-12s code %s: %s" % (what, err.code, err.message))</pre>
<pre class="out">AUTO01$ python3 cfgdemo.py
two sets (merge): 10.20.0.21/32 | first app
one edit (replace): 10.20.0.22/32 | None
<span class="hl">delete address app1 code 10: app1 cannot be deleted because of references from: | rulebase -&gt; security -&gt; rules -&gt; app-in destination</span>
delete rule app-in  ok
delete address app1 ok</pre>
<p>Two <code>set</code> calls merged: the address and the description both survived. One <code>edit</code> replaced the node, so the description vanished. Then the delete: <code>app1</code> is refused with <b>code 10</b> because the rule <code>app-in</code> still uses it, and the message names the rule and the field. Delete the rule first, then the address, and both succeed. PAN-OS tracks these references for you; your script must delete in the right order.</p>

<div class="warn"><p><b>Common mistakes.</b> Using <code>edit</code> when you meant <code>set</code> and wiping the fields you did not send. Pointing <code>set</code> at the parent and forgetting the <code>entry</code> name. Forgetting that a change is only in the candidate. Reading with <code>get</code> to prove a change is live.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get</code> returns the candidate, <code>show</code> the running configuration. Setting an object that already exists is not an error; it merges. A repeated create is therefore harmless, which helps idempotency (chapter 8).</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> The lab has one vsys and one device entry. On a multi-vsys firewall the vsys name in the xpath changes; on Panorama the tree is different again (device groups and templates). The wording of the code 10 message may differ on real PAN-OS.</p></div>

<div class="scn"><h4>The description that disappeared</h4><p>A script updated the IP of 300 address objects with <code>action=edit</code> and an element that contained only <code>&lt;ip-netmask&gt;</code>. Every description and tag on those objects was gone by morning, and the audit that depended on the tags failed. The fix was <code>action=set</code>, which merges, or an <code>edit</code> that sends the full node.</p><p><b>Lesson:</b> <code>set</code> adds and changes; <code>edit</code> replaces. Use the one you mean.</p></div>

<div class="iv"><p class="q">"What is the difference between get and show in the PAN-OS XML API?"</p><p>Both are <code>type=config</code> reads. <code>get</code> reads the candidate configuration, <code>show</code> reads the running configuration. After a <code>set</code> and before a commit, <code>get</code> shows the new object and <code>show</code> does not. I use <code>show</code> to verify that something is live.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An XPath is a route down the configuration tree; objects and rules sit under <code>vsys/entry[@name='vsys1']</code>.</li>
<li><code>get</code> = candidate, <code>show</code> = running; an object that does not exist is code 7 with an empty result.</li>
<li><code>set</code> merges, <code>edit</code> replaces the whole node, <code>delete</code> removes it.</li>
<li>A delete of something still referenced fails with code 10 and names the referrer.</li>
<li>Every write lands in the candidate only.</li>
</ul></div>
`,hi:`
<p>Firewall configuration ek bada filing cabinet hai. Folder ek tag hai, drawer ka label <code>entry[@name='...']</code> hai, aur <b>XPath</b> ek drawer tak ka raasta hai. Raasta likhna aa jaye to <code>type=config</code> ke paanch actions aasaan hain: <code>get</code> aur <code>show</code> padhte hain, <code>set</code> aur <code>edit</code> likhte hain, <code>delete</code> hatata hai.</p>

<div class="dia"><svg viewBox="0 0 640 212" role="img" aria-label="diagram">
<rect x="8" y="10" width="110" height="34" rx="10" fill="#ddd6fe"/><text x="63" y="32" text-anchor="middle" class="svg-ink" font-size="13">/config</text>
<rect x="8" y="60" width="110" height="34" rx="10" fill="#ddd6fe"/><text x="63" y="82" text-anchor="middle" class="svg-ink" font-size="13">devices</text>
<rect x="8" y="110" width="150" height="34" rx="10" fill="#ddd6fe"/><text x="83" y="132" text-anchor="middle" class="svg-ink" font-size="11">entry localhost.localdomain</text>
<rect x="190" y="110" width="90" height="34" rx="10" fill="#ddd6fe"/><text x="235" y="132" text-anchor="middle" class="svg-ink" font-size="13">vsys</text>
<rect x="300" y="110" width="90" height="34" rx="10" fill="#ddd6fe"/><text x="345" y="132" text-anchor="middle" class="svg-ink" font-size="12">entry vsys1</text>
<rect x="410" y="60" width="100" height="34" rx="10" fill="#fde68a"/><text x="460" y="82" text-anchor="middle" class="svg-ink" font-size="13">address</text>
<rect x="410" y="110" width="100" height="34" rx="10" fill="#fde68a"/><text x="460" y="132" text-anchor="middle" class="svg-ink" font-size="13">address-group</text>
<rect x="410" y="160" width="100" height="34" rx="10" fill="#fde68a"/><text x="460" y="182" text-anchor="middle" class="svg-ink" font-size="13">rulebase</text>
<rect x="530" y="60" width="100" height="34" rx="10" fill="#bbf7d0"/><text x="580" y="82" text-anchor="middle" class="svg-ink" font-size="12">entry web-srv</text>
<rect x="530" y="160" width="100" height="34" rx="10" fill="#bbf7d0"/><text x="580" y="182" text-anchor="middle" class="svg-ink" font-size="12">security/rules</text>
<line x1="63" y1="44" x2="63" y2="60" stroke="#64748b" stroke-width="2"/>
<line x1="63" y1="94" x2="63" y2="110" stroke="#64748b" stroke-width="2"/>
<line x1="158" y1="127" x2="190" y2="127" stroke="#64748b" stroke-width="2"/>
<line x1="280" y1="127" x2="300" y2="127" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="120" x2="410" y2="80" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="127" x2="410" y2="127" stroke="#64748b" stroke-width="2"/>
<line x1="390" y1="134" x2="410" y2="177" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="77" x2="530" y2="77" stroke="#64748b" stroke-width="2"/>
<line x1="510" y1="177" x2="530" y2="177" stroke="#64748b" stroke-width="2"/>
<text x="220" y="40" text-anchor="start" class="svg-ink" font-size="13">get  = candidate padho</text>
<text x="220" y="60" text-anchor="start" class="svg-ink" font-size="13">show = running config padho</text>
</svg><p class="cap">XPath is is tree mein neeche jaata path hai. Objects vsys ke neeche, apne naam wali entries mein rehte hain.</p></div>

<h3>Object tak ka raasta</h3>
<p>Virtual system ke objects, rules aur zones <code>vsys</code> ke neeche rehte hain. Interfaces aur system settings ek level upar, <code>devices/entry</code> ke neeche. Is firewall mein ek device hai, <code>localhost.localdomain</code>, aur ek vsys, <code>vsys1</code>, isliye <code>panconf.py</code> prefix ek baar rakhti hai:</p>
<pre class="code">VSYS = "/config/devices/entry[@name='localhost.localdomain']/vsys/entry[@name='vsys1']"
VSYS + "/address/entry[@name='web-srv']"
VSYS + "/rulebase/security/rules/entry[@name='allow-web']"</pre>
<p>Values ki lists, jaise rule ke zones ya addresses, baar baar aane wale <code>&lt;member&gt;</code> tags ki tarah likhi jaati hain. Akeli value, jaise <code>&lt;action&gt;allow&lt;/action&gt;</code>, seedha tag hai.</p>

<h3>Paanch actions</h3>
<table class="cmp"><tr><th>Action</th><th>Kya karta hai</th><th>Element</th></tr>
<tr><td><code>get</code></td><td><b>Candidate</b> configuration padhta hai</td><td>koi nahi</td></tr>
<tr><td><code>show</code></td><td><b>Running</b> configuration padhta hai</td><td>koi nahi</td></tr>
<tr><td><code>set</code></td><td>Node banata hai ya usme <b>merge</b> karta hai</td><td>node ke children</td></tr>
<tr><td><code>edit</code></td><td>Poore node ko <b>replace</b> karta hai</td><td>poora node, <code>entry</code> samet</td></tr>
<tr><td><code>delete</code></td><td>Node hatata hai</td><td>koi nahi</td></tr></table>
<p>Aur bhi hain: <code>rename</code>, <code>move</code> (rule ka order) aur <code>clone</code>. Jo jodi logon ko uljhati hai woh <code>get</code> aur <code>show</code> hai: ek shabd ka farak aur poori ek configuration ka farak.</p>

<h3>Candidate aur running, live</h3>
<p>Yeh Lab 1 task 2 ka doosra hissa hai. <code>candidate.py</code> ek address set karti hai aur wahi path dono actions se padhti hai.</p>
<pre class="code">from panconf import VSYS
from xapi import call

call(type="config", action="set", xpath=VSYS + "/address/entry[@name='web-srv']",
     element="&lt;ip-netmask&gt;10.20.0.10/32&lt;/ip-netmask&gt;&lt;description&gt;Web server&lt;/description&gt;")
for action in ("get", "show"):
    reply = call(type="config", action=action, xpath=VSYS + "/address")
    print("%-5s %s" % (action, [e.get("name") for e in reply.findall(".//entry")]))</pre>
<pre class="out">AUTO01$ python3 candidate.py
get   ['web-srv']
<span class="hl">show  []</span></pre>
<p>Candidate mein <code>web-srv</code> pehle se hai; running configuration mein nahi, kyunki kuch commit nahi hua. Yahan khaali list code 7 hai, data ke bina success. (Agla chapter ise commit karta hai.) Jaanna ho ki commit kya publish karega, to dono reads ko compare karo.</p>

<h3>Merge ya replace: set aur edit</h3>
<p><code>cfgdemo.py</code> woh farak dikhati hai jo asli zindagi mein sabse zyaada nuksaan karta hai, phir yeh ki jab aap koi aisi cheez delete karte ho jo abhi use mein hai to firewall kya kehta hai.</p>
<pre class="code">print("two sets (merge):", entry().findtext("ip-netmask"), "|", entry().findtext("description"))

call(type="config", action="edit", xpath=ADDR % "app1",
     element='&lt;entry name="app1"&gt;&lt;ip-netmask&gt;10.20.0.22/32&lt;/ip-netmask&gt;&lt;/entry&gt;')
print("one edit (replace):", entry().findtext("ip-netmask"), "|", entry().findtext("description"))

call(type="config", action="set", xpath=RULE % "app-in",
     element="&lt;from&gt;&lt;member&gt;trust&lt;/member&gt;&lt;/from&gt;&lt;to&gt;&lt;member&gt;dmz&lt;/member&gt;&lt;/to&gt;&lt;source&gt;&lt;member&gt;any&lt;/member&gt;&lt;/source&gt;"
             "&lt;destination&gt;&lt;member&gt;app1&lt;/member&gt;&lt;/destination&gt;&lt;application&gt;&lt;member&gt;any&lt;/member&gt;&lt;/application&gt;"
             "&lt;service&gt;&lt;member&gt;application-default&lt;/member&gt;&lt;/service&gt;&lt;action&gt;allow&lt;/action&gt;")
for what, path in (("address app1", ADDR % "app1"), ("rule app-in", RULE % "app-in"), ("address app1", ADDR % "app1")):
    try:
        call(type="config", action="delete", xpath=path)
        print("delete %-12s ok" % what)
    except PanApiError as err:
        print("delete %-12s code %s: %s" % (what, err.code, err.message))</pre>
<pre class="out">AUTO01$ python3 cfgdemo.py
two sets (merge): 10.20.0.21/32 | first app
one edit (replace): 10.20.0.22/32 | None
<span class="hl">delete address app1 code 10: app1 cannot be deleted because of references from: | rulebase -&gt; security -&gt; rules -&gt; app-in destination</span>
delete rule app-in  ok
delete address app1 ok</pre>
<p>Do <code>set</code> calls merge hui: address aur description dono bache. Ek <code>edit</code> ne node replace kar diya, isliye description gayab ho gaya. Phir delete: <code>app1</code> <b>code 10</b> se refuse hota hai kyunki rule <code>app-in</code> abhi use karta hai, aur message rule aur field ka naam batata hai. Pehle rule delete karo, phir address, dono chalte hain. PAN-OS yeh references khud track karta hai; aapki script ko sahi order mein delete karna hoga.</p>

<div class="warn"><p><b>Aam galtiyan.</b> <code>set</code> ki jagah <code>edit</code> use karna aur jo fields nahi bheje unhe mita dena. <code>set</code> ko parent par point karna aur <code>entry</code> ka naam bhool jaana. Yeh bhool jaana ki change sirf candidate mein hai. Change live hai yeh saabit karne ke liye <code>get</code> se padhna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>get</code> candidate lautata hai, <code>show</code> running configuration. Jo object pehle se hai use set karna error nahi hai; woh merge hota hai. Isliye dobara create harmless hai, jo idempotency mein madad karta hai (chapter 8).</p></div>
<div class="note"><p><b>In the lab vs on real gear.</b> Lab mein ek vsys aur ek device entry hai. Multi-vsys firewall par xpath mein vsys ka naam badalta hai; Panorama par tree phir alag hai (device groups aur templates). Code 10 message ke shabd asli PAN-OS par alag ho sakte hain.</p></div>

<div class="scn"><h4>Jo description gayab ho gayi</h4><p>Ek script ne 300 address objects ka IP <code>action=edit</code> aur sirf <code>&lt;ip-netmask&gt;</code> wale element se badla. Subah tak un objects ki har description aur tag ud chuka tha, aur tags par nirbhar audit fail ho gaya. Fix tha <code>action=set</code>, jo merge karta hai, ya aisa <code>edit</code> jo poora node bheje.</p><p><b>Lesson:</b> <code>set</code> jodta aur badalta hai; <code>edit</code> replace karta hai. Jo chahiye wahi use karo.</p></div>

<div class="iv"><p class="q">"PAN-OS XML API mein get aur show mein kya farak hai?"</p><p>Dono <code>type=config</code> reads hain. <code>get</code> candidate configuration padhta hai, <code>show</code> running configuration. <code>set</code> ke baad aur commit se pehle <code>get</code> naya object dikhata hai aur <code>show</code> nahi. Main <code>show</code> se verify karta hoon ki kuch live hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>XPath configuration tree mein neeche jaata raasta hai; objects aur rules <code>vsys/entry[@name='vsys1']</code> ke neeche hain.</li>
<li><code>get</code> = candidate, <code>show</code> = running; jo object nahi hai woh code 7 aur khaali result hai.</li>
<li><code>set</code> merge karta hai, <code>edit</code> poora node replace karta hai, <code>delete</code> use hata deta hai.</li>
<li>Abhi use mein aaye object ka delete code 10 se fail hota hai aur referrer ka naam batata hai.</li>
<li>Har write sirf candidate mein jaata hai.</li>
</ul></div>
`}};export{e as default};