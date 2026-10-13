var e={id:`netconf-hands-on`,h:{en:`NETCONF hands-on: filtered get-config and edit-config`,hi:`NETCONF hands-on: filtered get-config aur edit-config`},body:{en:`
<p>Asking a librarian for "everything you have" gets you a truck of books. Asking for "the networking shelf, only titles" gets you one page. NETCONF works the same way: an unfiltered <code>get</code> on a real router returns megabytes of XML, so you almost always send a <b>filter</b>. Then, to change something, you send a small XML "patch" that follows the model. This chapter walks Lab 1 tasks 3 and 4 line by line.</p>

<h3>Step 1: read the interfaces with a filter</h3>
<p>Inside the NETCONF session from chapter 5, the lab client wraps each operation in an <code>&lt;rpc&gt;</code> for you, so you can type the short form:</p>
<pre class="out">netconf 192.168.50.1&gt; get-config running /interfaces
&gt;&gt;&gt; &lt;rpc message-id="101" ...&gt;&lt;get-config&gt;&lt;source&gt;&lt;running/&gt;&lt;/source&gt;&lt;filter type="xpath" select="/if:interfaces"/&gt;&lt;/get-config&gt;&lt;/rpc&gt;
&lt;&lt;&lt;
<span class="hl">&lt;rpc-reply message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;</span>
  &lt;data&gt;
    &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
      &lt;interface&gt;
        &lt;name&gt;GigabitEthernet0/0&lt;/name&gt;
        &lt;description&gt;MGMT-LAN&lt;/description&gt;
        &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:ethernetCsmacd&lt;/type&gt;
        &lt;enabled&gt;true&lt;/enabled&gt;
        &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;
          &lt;address&gt;&lt;ip&gt;192.168.50.1&lt;/ip&gt;&lt;netmask&gt;255.255.255.0&lt;/netmask&gt;&lt;/address&gt;
        &lt;/ipv4&gt;
      &lt;/interface&gt;
      ... GigabitEthernet0/1, Loopback0 ...
    &lt;/interfaces&gt;
  &lt;/data&gt;
&lt;/rpc-reply&gt;</pre>
<p>Notice: the reply's <code>message-id</code> matches the request; the data is wrapped in <code>&lt;data&gt;</code>; every top-level element carries its model namespace; the IP address lives under <code>ipv4</code> in the ietf-ip namespace because ietf-ip <b>augments</b> the interface. There is no <code>oper-status</code> in the reply because <code>get-config</code> never returns config false data.</p>

<h3>Filters: XPath and subtree</h3>
<ul>
<li><b>XPath</b> (needs <code>:xpath</code>): <code>/interfaces/interface[name='Loopback0']</code> returns just one entry. On the wire it is <code>&lt;filter type="xpath" select="..."/&gt;</code>.</li>
<li><b>Subtree</b> (always supported): an XML skeleton of what you want. <code>&lt;filter type="subtree"&gt;&lt;interfaces xmlns="..."&gt;&lt;interface&gt;&lt;name&gt;Loopback0&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/filter&gt;</code>. An element with a value is a match condition; an empty element selects that node.</li>
</ul>
<p>Try <code>get /interfaces</code> in the lab and compare: now <code>oper-status</code>, <code>phys-address</code> and <code>statistics</code> appear. That single comparison is the clearest way to remember <b>get versus get-config</b>.</p>

<h3>Step 2: add Loopback100 with edit-config</h3>
<p>Task 4 wants Loopback100 with 10.100.100.1/32 and the description "Managed by NETCONF". Build it from the tree: container <code>interfaces</code>, list entry <code>interface</code> with key <code>name</code>, leaves <code>description</code>, <code>type</code>, <code>enabled</code>, and the augmented <code>ipv4/address</code>.</p>
<pre class="code">edit-config running
&lt;config&gt;
  &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
    &lt;interface&gt;
      &lt;name&gt;Loopback100&lt;/name&gt;                     <span class="c">&lt;!-- list key --&gt;</span>
      &lt;description&gt;Managed by NETCONF&lt;/description&gt;
      &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:softwareLoopback&lt;/type&gt;
      &lt;enabled&gt;true&lt;/enabled&gt;
      &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;
        &lt;address&gt;&lt;ip&gt;10.100.100.1&lt;/ip&gt;&lt;netmask&gt;255.255.255.255&lt;/netmask&gt;&lt;/address&gt;
      &lt;/ipv4&gt;
    &lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/config&gt;</pre>
<p>In the lab you type the whole command on one line. The reply you want is:</p>
<pre class="out">&lt;rpc-reply message-id="102" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
<span class="hl">  &lt;ok/&gt;</span>
&lt;/rpc-reply&gt;</pre>
<p>R1 logs <code>%DMI-5-CONFIG_I</code> and <code>show running-config interface Loopback100</code> now shows the description and address. No <code>commit</code> is needed because the target was running. Finish with <code>close-session</code>, which returns <code>&lt;ok/&gt;</code> and frees the session.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="edit-config flow">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">DEVBOX</text>
<rect x="250" y="20" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="12">1. parse XML</text>
<rect x="250" y="75" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="12">2. validate vs YANG</text>
<rect x="250" y="130" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="330" y="155" text-anchor="middle" class="svg-ink" font-size="12">3. apply to running</text>
<rect x="490" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="13">R1 config</text>
<line x1="150" y1="95" x2="250" y2="40" stroke="#64748b"/><line x1="330" y1="60" x2="330" y2="75" stroke="#64748b"/><line x1="330" y1="115" x2="330" y2="130" stroke="#64748b"/><line x1="410" y1="150" x2="490" y2="100" stroke="#64748b"/>
<text x="200" y="190" text-anchor="middle" class="svg-accent" font-size="12">any failure: rpc-error, nothing applied</text>
</svg><p class="cap">edit-config is validated against the model before it touches running; rollback-on-error keeps it all-or-nothing.</p></div>

<h3>The operation attribute</h3>
<p>By default an edit <b>merges</b> into the datastore. You can change that per element with <code>nc:operation</code> (namespace of NETCONF base) or for the whole request with <code>&lt;default-operation&gt;</code>:</p>
<table class="cmp"><tr><th>operation</th><th>Effect</th><th>If the node exists / is missing</th></tr>
<tr><td><b>merge</b> (default)</td><td>Combine with what is there</td><td>updates / creates</td></tr>
<tr><td><b>replace</b></td><td>Replace the node and everything under it</td><td>overwrites / creates</td></tr>
<tr><td><b>create</b></td><td>Create only</td><td>error <code>data-exists</code> / creates</td></tr>
<tr><td><b>delete</b></td><td>Delete</td><td>deletes / error <code>data-missing</code></td></tr>
<tr><td><b>remove</b></td><td>Delete if present</td><td>deletes / silently ok</td></tr></table>
<pre class="code">&lt;interface xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" nc:operation="delete"&gt;
  &lt;name&gt;Loopback100&lt;/name&gt;
&lt;/interface&gt;</pre>

<div class="eg"><p><b>Worked example.</b> Loopback100 has description "Managed by NETCONF". You send an edit with only <code>&lt;name&gt;Loopback100&lt;/name&gt;&lt;description&gt;Test&lt;/description&gt;</code>. With merge, only the description changes and the IP stays. With <code>nc:operation="replace"</code> on the interface, the entry is replaced by exactly what you sent, so the IPv4 address disappears (and a new interface would even need its mandatory <code>type</code>). That is why replace is powerful and dangerous.</p></div>

<div class="warn"><p><b>Common mistake.</b> Leaving out the namespace. <code>&lt;interfaces&gt;</code> without <code>xmlns</code> returns an <code>&lt;rpc-error&gt;</code> with <code>unknown-namespace</code>. Another classic: putting <code>&lt;ipv4&gt;</code> in the ietf-interfaces namespace; it belongs to ietf-ip.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>delete</b> fails if the data is absent; <b>remove</b> does not. <b>create</b> fails if the data exists. <b>merge</b> is the default. <code>get-config</code> needs a <code>&lt;source&gt;</code>; <code>edit-config</code> needs a <code>&lt;target&gt;</code>.</p></div>

<div class="scn"><h4>The replace that wiped a router</h4><p>A junior engineer used <code>&lt;default-operation&gt;replace&lt;/default-operation&gt;</code> with a payload containing one interface description, targeting the top <code>interfaces</code> container. The device replaced the whole container: every other interface lost its IP address, and the management session dropped. Console access and <code>rollback</code> from the archive restored service.</p><p><b>Lesson:</b> scope replace to the smallest node you mean, prefer merge for small changes, and test on a lab box first.</p></div>

<div class="iv"><p class="q">"How would you add a loopback with NETCONF, and how do you know it worked?"</p><p>Strong answer: open a session to port 830, check the hello for writable-running or candidate, send edit-config to the right target with a config body built from the ietf-interfaces and ietf-ip trees, including namespaces, the key name, the type identity softwareLoopback and the address. Expect rpc-reply with ok; commit if the target was candidate. Verify with a filtered get-config and on the CLI, and look for the DMI config log.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Always filter: XPath (<code>/interfaces/interface[name='X']</code>) or subtree.</li>
<li><code>get</code> shows state (oper-status, statistics); <code>get-config</code> does not.</li>
<li>edit-config XML must follow the tree and carry each module's namespace; ipv4 is in ietf-ip.</li>
<li>Success is <code>&lt;ok/&gt;</code>; failure is <code>&lt;rpc-error&gt;</code> with an error-tag and nothing applied.</li>
<li>Operations: merge (default), replace, create, delete, remove.</li>
</ul></div>
`,hi:`
<p>Librarian se "jo kuch bhi aapke paas hai" maangoge to kitabon ka truck milega. "Networking shelf, sirf titles" maangoge to ek page milega. NETCONF bhi aise hi kaam karta hai: asli router par bina filter ka <code>get</code> megabytes ka XML deta hai, isliye aap lagbhag hamesha ek <b>filter</b> bhejte ho. Phir kuch badalne ke liye, aap ek chhota XML "patch" bhejte ho jo model follow karta hai. Yeh chapter Lab 1 ke tasks 3 aur 4 ko line by line chalta hai.</p>

<h3>Step 1: filter ke saath interfaces padho</h3>
<p>Chapter 5 wale NETCONF session ke andar, lab client har operation ko aapke liye <code>&lt;rpc&gt;</code> mein lapet deta hai, isliye aap short form type kar sakte ho:</p>
<pre class="out">netconf 192.168.50.1&gt; get-config running /interfaces
&gt;&gt;&gt; &lt;rpc message-id="101" ...&gt;&lt;get-config&gt;&lt;source&gt;&lt;running/&gt;&lt;/source&gt;&lt;filter type="xpath" select="/if:interfaces"/&gt;&lt;/get-config&gt;&lt;/rpc&gt;
&lt;&lt;&lt;
<span class="hl">&lt;rpc-reply message-id="101" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;</span>
  &lt;data&gt;
    &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
      &lt;interface&gt;
        &lt;name&gt;GigabitEthernet0/0&lt;/name&gt;
        &lt;description&gt;MGMT-LAN&lt;/description&gt;
        &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:ethernetCsmacd&lt;/type&gt;
        &lt;enabled&gt;true&lt;/enabled&gt;
        &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;
          &lt;address&gt;&lt;ip&gt;192.168.50.1&lt;/ip&gt;&lt;netmask&gt;255.255.255.0&lt;/netmask&gt;&lt;/address&gt;
        &lt;/ipv4&gt;
      &lt;/interface&gt;
      ... GigabitEthernet0/1, Loopback0 ...
    &lt;/interfaces&gt;
  &lt;/data&gt;
&lt;/rpc-reply&gt;</pre>
<p>Dhyan do: reply ka <code>message-id</code> request se match karta hai; data <code>&lt;data&gt;</code> mein lipta hai; har top-level element apna model namespace rakhta hai; IP address ietf-ip namespace mein <code>ipv4</code> ke neeche hai kyunki ietf-ip interface ko <b>augment</b> karta hai. Reply mein <code>oper-status</code> nahi hai kyunki <code>get-config</code> kabhi config false data nahi deta.</p>

<h3>Filters: XPath aur subtree</h3>
<ul>
<li><b>XPath</b> (<code>:xpath</code> chahiye): <code>/interfaces/interface[name='Loopback0']</code> sirf ek entry deta hai. Wire par yeh <code>&lt;filter type="xpath" select="..."/&gt;</code> hai.</li>
<li><b>Subtree</b> (hamesha supported): jo chahiye uska XML dhaancha. <code>&lt;filter type="subtree"&gt;&lt;interfaces xmlns="..."&gt;&lt;interface&gt;&lt;name&gt;Loopback0&lt;/name&gt;&lt;/interface&gt;&lt;/interfaces&gt;&lt;/filter&gt;</code>. Value wala element match condition hai; khaali element us node ko select karta hai.</li>
</ul>
<p>Lab mein <code>get /interfaces</code> try karo aur compare karo: ab <code>oper-status</code>, <code>phys-address</code> aur <code>statistics</code> dikhte hain. Yahi ek comparison <b>get vs get-config</b> yaad rakhne ka sabse saaf tarika hai.</p>

<h3>Step 2: edit-config se Loopback100 add karo</h3>
<p>Task 4 ko 10.100.100.1/32 aur description "Managed by NETCONF" ke saath Loopback100 chahiye. Ise tree se banao: container <code>interfaces</code>, key <code>name</code> ke saath list entry <code>interface</code>, leaves <code>description</code>, <code>type</code>, <code>enabled</code>, aur augment hua <code>ipv4/address</code>.</p>
<pre class="code">edit-config running
&lt;config&gt;
  &lt;interfaces xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"&gt;
    &lt;interface&gt;
      &lt;name&gt;Loopback100&lt;/name&gt;                     <span class="c">&lt;!-- list key --&gt;</span>
      &lt;description&gt;Managed by NETCONF&lt;/description&gt;
      &lt;type xmlns:ianaift="urn:ietf:params:xml:ns:yang:iana-if-type"&gt;ianaift:softwareLoopback&lt;/type&gt;
      &lt;enabled&gt;true&lt;/enabled&gt;
      &lt;ipv4 xmlns="urn:ietf:params:xml:ns:yang:ietf-ip"&gt;
        &lt;address&gt;&lt;ip&gt;10.100.100.1&lt;/ip&gt;&lt;netmask&gt;255.255.255.255&lt;/netmask&gt;&lt;/address&gt;
      &lt;/ipv4&gt;
    &lt;/interface&gt;
  &lt;/interfaces&gt;
&lt;/config&gt;</pre>
<p>Lab mein aap poori command ek line mein type karte ho. Aapko yeh reply chahiye:</p>
<pre class="out">&lt;rpc-reply message-id="102" xmlns="urn:ietf:params:xml:ns:netconf:base:1.0"&gt;
<span class="hl">  &lt;ok/&gt;</span>
&lt;/rpc-reply&gt;</pre>
<p>R1 <code>%DMI-5-CONFIG_I</code> log karta hai aur <code>show running-config interface Loopback100</code> ab description aur address dikhata hai. <code>commit</code> ki zaroorat nahi kyunki target running tha. <code>close-session</code> se khatam karo, jo <code>&lt;ok/&gt;</code> lautata hai aur session free karta hai.</p>

<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="edit-config flow">
<rect x="20" y="70" width="130" height="50" rx="8" fill="#bbf7d0"/><text x="85" y="100" text-anchor="middle" class="svg-ink" font-size="13">DEVBOX</text>
<rect x="250" y="20" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="330" y="45" text-anchor="middle" class="svg-ink" font-size="12">1. XML parse</text>
<rect x="250" y="75" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="330" y="100" text-anchor="middle" class="svg-ink" font-size="12">2. YANG se validate</text>
<rect x="250" y="130" width="160" height="40" rx="8" fill="#ddd6fe"/><text x="330" y="155" text-anchor="middle" class="svg-ink" font-size="12">3. running par apply</text>
<rect x="490" y="70" width="130" height="50" rx="8" fill="#bae6fd"/><text x="555" y="100" text-anchor="middle" class="svg-ink" font-size="13">R1 config</text>
<line x1="150" y1="95" x2="250" y2="40" stroke="#64748b"/><line x1="330" y1="60" x2="330" y2="75" stroke="#64748b"/><line x1="330" y1="115" x2="330" y2="130" stroke="#64748b"/><line x1="410" y1="150" x2="490" y2="100" stroke="#64748b"/>
<text x="200" y="190" text-anchor="middle" class="svg-accent" font-size="12">koi bhi failure: rpc-error, kuch apply nahi</text>
</svg><p class="cap">edit-config running ko chhoone se pehle model ke against validate hota hai; rollback-on-error ise all-or-nothing rakhta hai.</p></div>

<h3>Operation attribute</h3>
<p>Default mein edit datastore mein <b>merge</b> hota hai. Aap ise har element par <code>nc:operation</code> (NETCONF base ka namespace) se ya poori request ke liye <code>&lt;default-operation&gt;</code> se badal sakte ho:</p>
<table class="cmp"><tr><th>operation</th><th>Asar</th><th>Agar node exist karta hai / gayab hai</th></tr>
<tr><td><b>merge</b> (default)</td><td>Jo hai uske saath combine</td><td>update karta hai / banata hai</td></tr>
<tr><td><b>replace</b></td><td>Node aur uske neeche sab replace</td><td>overwrite karta hai / banata hai</td></tr>
<tr><td><b>create</b></td><td>Sirf banao</td><td>error <code>data-exists</code> / banata hai</td></tr>
<tr><td><b>delete</b></td><td>Delete</td><td>delete karta hai / error <code>data-missing</code></td></tr>
<tr><td><b>remove</b></td><td>Ho to delete</td><td>delete karta hai / chupchaap ok</td></tr></table>
<pre class="code">&lt;interface xmlns:nc="urn:ietf:params:xml:ns:netconf:base:1.0" nc:operation="delete"&gt;
  &lt;name&gt;Loopback100&lt;/name&gt;
&lt;/interface&gt;</pre>

<div class="eg"><p><b>Worked example.</b> Loopback100 ka description "Managed by NETCONF" hai. Aap sirf <code>&lt;name&gt;Loopback100&lt;/name&gt;&lt;description&gt;Test&lt;/description&gt;</code> ke saath edit bhejte ho. Merge ke saath sirf description badalta hai aur IP rehta hai. Interface par <code>nc:operation="replace"</code> ke saath entry bilkul usi se replace hoti hai jo aapne bheja, isliye IPv4 address gayab ho jaata hai (aur naye interface ko to mandatory <code>type</code> bhi chahiye hota). Isiliye replace powerful bhi hai aur khatarnak bhi.</p></div>

<div class="warn"><p><b>Common galti.</b> Namespace chhod dena. <code>xmlns</code> ke bina <code>&lt;interfaces&gt;</code> <code>unknown-namespace</code> ke saath <code>&lt;rpc-error&gt;</code> deta hai. Ek aur classic: <code>&lt;ipv4&gt;</code> ko ietf-interfaces namespace mein rakhna; woh ietf-ip ka hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>delete</b> fail hota hai agar data absent ho; <b>remove</b> nahi. <b>create</b> fail hota hai agar data exist kare. <b>merge</b> default hai. <code>get-config</code> ko <code>&lt;source&gt;</code> chahiye; <code>edit-config</code> ko <code>&lt;target&gt;</code>.</p></div>

<div class="scn"><h4>Replace jisne router saaf kar diya</h4><p>Ek junior engineer ne <code>&lt;default-operation&gt;replace&lt;/default-operation&gt;</code> ek aise payload ke saath use kiya jisme ek interface description tha, top <code>interfaces</code> container ko target karke. Device ne poora container replace kar diya: har doosre interface ka IP address chala gaya, aur management session drop ho gaya. Console access aur archive se <code>rollback</code> ne service wapas laayi.</p><p><b>Seekh:</b> replace ko sabse chhote node tak scope karo jo aap chahte ho, chhote changes ke liye merge pasand karo, aur pehle lab box par test karo.</p></div>

<div class="iv"><p class="q">"Aap NETCONF se loopback kaise add karoge, aur kaise pata chalega ki kaam kiya?"</p><p>Strong answer: port 830 par session kholo, hello mein writable-running ya candidate check karo, sahi target par edit-config bhejo jiski config body ietf-interfaces aur ietf-ip trees se bani ho, namespaces, key name, type identity softwareLoopback aur address ke saath. ok wala rpc-reply expect karo; target candidate tha to commit karo. Filtered get-config aur CLI se verify karo, aur DMI config log dekho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Hamesha filter karo: XPath (<code>/interfaces/interface[name='X']</code>) ya subtree.</li>
<li><code>get</code> state (oper-status, statistics) dikhata hai; <code>get-config</code> nahi.</li>
<li>edit-config XML tree follow kare aur har module ka namespace rakhe; ipv4 ietf-ip mein hai.</li>
<li>Success <code>&lt;ok/&gt;</code> hai; failure error-tag ke saath <code>&lt;rpc-error&gt;</code> hai aur kuch apply nahi hota.</li>
<li>Operations: merge (default), replace, create, delete, remove.</li>
</ul></div>
`}};export{e as default};