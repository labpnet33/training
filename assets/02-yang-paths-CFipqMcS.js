var e={id:`yang-paths`,h:{en:`YANG models and paths: telling the router what you want to see`,hi:`YANG models aur paths: router ko batana ki kya dekhna hai`},body:{en:`
<p><b>What is YANG?</b> YANG is a language for describing the structure of configuration and operational data on a device. It is like a blueprint of a filing cabinet: it says which drawers exist, what folders are inside, and what type of value each sheet holds. A device that implements a YANG model exposes its data in exactly that shape, so software can ask for it by name. You met YANG basics in encor-yang; here we focus on how paths are used for telemetry.</p>
<h3>Building blocks</h3>
<dl class="terms"><dt>module</dt><dd>One YANG file with a name, for example openconfig-interfaces.</dd><dt>container</dt><dd>A folder that groups other nodes.</dd><dt>list</dt><dd>A repeated entry identified by a key, for example one entry per interface name.</dd><dt>leaf</dt><dd>A single value, such as in-errors or admin-status.</dd><dt>config true / false</dt><dd>Configuration data you can set, versus operational (state) data that is read-only.</dd></dl>
<h3>Three families of models</h3>
<table class="cmp"><tr><th>Family</th><th>Who defines it</th><th>Example</th></tr><tr><td>Native (vendor)</td><td>Cisco, per OS (IOS XR, IOS XE, NX-OS)</td><td>Cisco-IOS-XR-infra-statsd-oper</td></tr><tr><td>OpenConfig</td><td>Operator-driven vendor-neutral group</td><td>openconfig-interfaces, openconfig-bgp</td></tr><tr><td>IETF</td><td>Standards body (RFCs)</td><td>ietf-interfaces (RFC 8343)</td></tr></table>
<p>Native models usually expose the most detail and match the device exactly. OpenConfig models are the same across vendors, which is valuable in a multi-vendor SP. A common design is OpenConfig where coverage is enough and native models for the rest. Cisco also publishes models by name with <b>-oper</b> for operational data and <b>-cfg</b> for configuration.</p>
<h3>Paths</h3>
<p>A <b>path</b> is the address of a node in the model, written like a file path. A subscription names the path you want. Keys select one list entry. Two common styles:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - example sensor and xpath paths</span>
<span class="c">! Cisco IOS XR native operational path (module:path, no leading slash in sensor-path)</span>
Cisco-IOS-XR-infra-statsd-oper:infra-statistics/interfaces/interface/latest/generic-counters

<span class="c">! OpenConfig style path with a list key (gNMI uses leading slashes)</span>
/interfaces/interface[name=GigabitEthernet0/0/0/0]/state/counters

<span class="c">! IOS XE xpath style</span>
/interfaces-ios-xe-oper:interfaces/interface/statistics</pre>
<p>If you leave out the key (<code>[name=...]</code>) the path covers every list entry, which is what you normally want for interface counters. Asking for a very high-level path such as the whole <code>interfaces</code> container returns a lot of data; ask for the narrowest path that answers your question.</p>
<h3>Finding the right path</h3>
<ul><li>Read the YANG module (the <code>pyang</code> tool prints a tree), or use the vendor's model browser.</li>
<li>Ask the device which models it supports (NETCONF hello capabilities, or gNMI Capabilities).</li>
<li>Test the path with a one-time Get before putting it in a streaming subscription.</li></ul>
<div class="eg"><p><b>Worked example.</b> You want input errors per interface on an IOS XR PE. The operational model Cisco-IOS-XR-infra-statsd-oper has a list <code>interface</code> with a container <code>latest/generic-counters</code> that holds <code>input-errors</code>. The sensor path ends at generic-counters, so each streamed record has all the counters for each interface, tagged with the interface name key.</p></div>
<div class="warn"><p><b>Common mistake.</b> Asking for a config path when you need state. Config nodes show what you configured; state or operational nodes show what is happening (counters, up/down). Telemetry almost always wants operational paths.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the vocabulary: container, list, leaf, key, module, revision; config true versus false; native versus OpenConfig versus IETF models. Know that a path with a list key selects one entry and without it selects all.</p></div>
<div class="scn"><h4>The path that returned nothing</h4><p>An engineer subscribed to an OpenConfig path and the collector received nothing. A one-time Get against the same path returned an error saying the path was not supported on that software release. The fix was to use the vendor native operational path for that platform, and to run a Capabilities request before designing new subscriptions.</p><p><b>Lesson:</b> Verify support with Capabilities and Get before streaming.</p></div>
<div class="iv"><p class="q">"What is the difference between native and OpenConfig models?"</p><p>Native models are defined per vendor and OS and expose everything the device offers. OpenConfig models are vendor-neutral and written by operators, so the same path works across vendors, but coverage can be narrower. In a multi-vendor provider I prefer OpenConfig for common data such as interface counters and fall back to native for features it lacks.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>YANG models define data as modules, containers, lists and leaves.</li>
<li>Native, OpenConfig and IETF are the three model families.</li>
<li>A path is the address of a node; keys select list entries.</li>
<li>Use operational (state) paths for telemetry.</li>
<li>Test a path with Get before subscribing.</li></ul></div>
`,hi:`
<p><b>YANG kya hai?</b> YANG device par configuration aur operational data ka structure describe karne ki language hai. Yeh filing cabinet ke blueprint jaisi hai: batati hai kaunse drawers hain, andar kaunse folders hain, aur har sheet par kis type ki value hai. Jo device YANG model implement karta hai woh apna data theek usi shape mein expose karta hai, isliye software use naam se maang sakta hai. YANG basics aapne encor-yang mein dekhe; yahan hum dekhte hain ki telemetry ke liye paths kaise use hote hain.</p>
<h3>Building blocks</h3>
<dl class="terms"><dt>module</dt><dd>Naam wali ek YANG file, jaise openconfig-interfaces.</dd><dt>container</dt><dd>Folder jo doosre nodes ko group karta hai.</dd><dt>list</dt><dd>Key se identify hone wali repeated entry, jaise har interface name ki ek entry.</dd><dt>leaf</dt><dd>Ek single value, jaise in-errors ya admin-status.</dd><dt>config true / false</dt><dd>Configuration data jo set kar sakte ho, versus operational (state) data jo read-only hai.</dd></dl>
<h3>Models ke teen families</h3>
<table class="cmp"><tr><th>Family</th><th>Kaun define karta hai</th><th>Example</th></tr><tr><td>Native (vendor)</td><td>Cisco, har OS ke liye (IOS XR, IOS XE, NX-OS)</td><td>Cisco-IOS-XR-infra-statsd-oper</td></tr><tr><td>OpenConfig</td><td>Operator-driven vendor-neutral group</td><td>openconfig-interfaces, openconfig-bgp</td></tr><tr><td>IETF</td><td>Standards body (RFCs)</td><td>ietf-interfaces (RFC 8343)</td></tr></table>
<p>Native models aam taur par sabse zyada detail dete hain aur device se bilkul match karte hain. OpenConfig models sab vendors par same hote hain, jo multi-vendor SP mein valuable hai. Common design hai jahan coverage kaafi ho wahan OpenConfig aur baaki ke liye native models. Cisco models naam ke saath publish karta hai: operational data ke liye <b>-oper</b> aur configuration ke liye <b>-cfg</b>.</p>
<h3>Paths</h3>
<p><b>Path</b> model mein node ka address hai, file path ki tarah likha jaata hai. Subscription us path ka naam leti hai jo aap chahte ho. Keys ek list entry select karti hain. Do common styles:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator) - example sensor and xpath paths</span>
<span class="c">! Cisco IOS XR native operational path (module:path, no leading slash in sensor-path)</span>
Cisco-IOS-XR-infra-statsd-oper:infra-statistics/interfaces/interface/latest/generic-counters

<span class="c">! OpenConfig style path with a list key (gNMI uses leading slashes)</span>
/interfaces/interface[name=GigabitEthernet0/0/0/0]/state/counters

<span class="c">! IOS XE xpath style</span>
/interfaces-ios-xe-oper:interfaces/interface/statistics</pre>
<p>Agar aap key (<code>[name=...]</code>) chhod do to path har list entry cover karta hai, jo interface counters ke liye aam taur par chahiye. Bahut high-level path, jaise poora <code>interfaces</code> container, maangne par bahut data aata hai; sabse narrow path maango jo aapke sawaal ka jawab de.</p>
<h3>Sahi path dhoondhna</h3>
<ul><li>YANG module padho (<code>pyang</code> tool tree print karta hai), ya vendor ka model browser use karo.</li>
<li>Device se poochho ki woh kaunse models support karta hai (NETCONF hello capabilities, ya gNMI Capabilities).</li>
<li>Streaming subscription mein daalne se pehle path ko one-time Get se test karo.</li></ul>
<div class="eg"><p><b>Worked example.</b> Aapko IOS XR PE par har interface ke input errors chahiye. Operational model Cisco-IOS-XR-infra-statsd-oper mein list <code>interface</code> hai aur container <code>latest/generic-counters</code> jisme <code>input-errors</code> hota hai. Sensor path generic-counters par khatam hota hai, isliye har streamed record mein har interface ke saare counters hote hain, interface name key ke saath tagged.</p></div>
<div class="warn"><p><b>Common mistake.</b> Jab state chahiye tab config path maangna. Config nodes dikhate hain aapne kya configure kiya; state ya operational nodes dikhate hain kya ho raha hai (counters, up/down). Telemetry ko lagbhag hamesha operational paths chahiye.</p></div>
<div class="exam"><p><b>Exam trap.</b> Vocabulary yaad rakho: container, list, leaf, key, module, revision; config true versus false; native versus OpenConfig versus IETF models. Yaad rakho ki list key wala path ek entry select karta hai aur bina key ke sab.</p></div>
<div class="scn"><h4>Woh path jisne kuch return nahi kiya</h4><p>Engineer ne ek OpenConfig path par subscribe kiya aur collector ko kuch nahi mila. Usi path par one-time Get ne error diya ki yeh path us software release par supported nahi hai. Fix tha us platform ke liye vendor native operational path use karna, aur nayi subscriptions design karne se pehle Capabilities request chalana.</p><p><b>Lesson:</b> Streaming se pehle Capabilities aur Get se support verify karo.</p></div>
<div class="iv"><p class="q">"Native aur OpenConfig models mein kya difference hai?"</p><p>Native models vendor aur OS ke hisaab se define hote hain aur device ki har cheez expose karte hain. OpenConfig models vendor-neutral hain aur operators ne likhe hain, isliye same path vendors par chalta hai, par coverage narrow ho sakti hai. Multi-vendor provider mein main common data jaise interface counters ke liye OpenConfig prefer karta hoon aur jo usme nahi hai uske liye native par jaata hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>YANG models data ko modules, containers, lists aur leaves ke roop mein define karte hain.</li>
<li>Native, OpenConfig aur IETF teen model families hain.</li>
<li>Path node ka address hai; keys list entries select karti hain.</li>
<li>Telemetry ke liye operational (state) paths use karo.</li>
<li>Subscribe karne se pehle path ko Get se test karo.</li></ul></div>
`}};export{e as default};