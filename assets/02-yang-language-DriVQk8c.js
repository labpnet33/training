var e={id:`yang-language`,h:{en:`YANG building blocks: modules, containers, lists and leaves`,hi:`YANG ke building blocks: modules, containers, lists aur leaves`},body:{en:`
<p>Think of a filing cabinet. The cabinet has a label (the <b>module</b>), drawers that hold related folders (<b>containers</b>), a drawer of identical folders sorted by a tab name (a <b>list</b> with a <b>key</b>), and on each folder single facts written in boxes (<b>leaves</b>). YANG is simply the language used to describe that cabinet so every program agrees where each fact lives and what type it has.</p>

<h3>What YANG is</h3>
<p><b>YANG</b> (Yet Another Next Generation) is a <b>data modelling language</b> defined in RFC 6020 (version 1) and <b>RFC 7950</b> (version 1.1). It describes the configuration and operational state of a device, plus RPCs (actions) and notifications (events). YANG itself is never sent to a device; it is the contract that the XML or JSON you send must follow. Its benefits, which the exam asks you to describe, are: it is <b>human-readable</b> yet precise, <b>hierarchical</b> like the data it describes, strongly <b>typed</b> with constraints (ranges, patterns, mandatory), <b>reusable</b> through typedefs and groupings, <b>extensible</b> through augment, and <b>protocol-independent</b> (the same model serves NETCONF, RESTCONF and gNMI).</p>

<h3>The module header</h3>
<pre class="code">module nk-native {
  yang-version 1.1;
  namespace "urn:nk:yang:nk-native";   <span class="c">// globally unique name, used in XML</span>
  prefix nk;                            <span class="c">// short alias used inside YANG files</span>
  import ietf-inet-types { prefix inet; }
  revision 2026-01-15 { description "Initial lab model"; }
  ...
}</pre>
<p>The <b>namespace</b> is a URN that makes every node globally unique; NETCONF XML must carry it (<code>xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"</code>). The <b>prefix</b> is a short alias used when one module refers to another. The <b>revision</b> date identifies the version; devices advertise module plus revision in their capabilities. A <b>submodule</b> can split a large module into files.</p>

<h3>The node types</h3>
<dl class="terms">
<dt>container</dt><dd>Groups related nodes and appears at most once, like a drawer. <code>interfaces</code> is a container. A <b>presence container</b> means something just by existing (shown with <code>!</code> in a tree).</dd>
<dt>list</dt><dd>Many entries with the same structure. Each entry is identified by one or more <b>key</b> leaves. <code>list interface { key "name"; ... }</code> means every interface entry is found by its name.</dd>
<dt>leaf</dt><dd>A single value with a type: <code>leaf description { type string; }</code>, <code>leaf enabled { type boolean; default true; }</code>. Leaves have no children.</dd>
<dt>leaf-list</dt><dd>A list of simple values of one type, no key: for example several DNS server addresses or NTP servers.</dd>
<dt>typedef</dt><dd>A named, reusable type built on a base type with restrictions: <code>typedef vlan-id { type uint16 { range "1..4094"; } }</code>.</dd>
<dt>grouping / uses</dt><dd>A reusable block of nodes defined once with <code>grouping</code> and copied wherever <code>uses</code> appears; like a template paragraph.</dd>
<dt>augment</dt><dd>One module adds nodes into another module's tree without editing it. ietf-ip augments <code>/if:interfaces/if:interface</code> with <code>ipv4</code> and <code>ipv6</code>.</dd>
<dt>choice / case</dt><dd>Mutually exclusive alternatives: an address has either <code>prefix-length</code> or <code>netmask</code>.</dd>
<dt>config false</dt><dd>Marks operational state (counters, oper-status, neighbour counts): read-only data you can GET but never write.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="YANG hierarchy">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">module ietf-interfaces</text>
<rect x="230" y="70" width="180" height="36" rx="8" fill="#bae6fd"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">container interfaces</text>
<rect x="210" y="130" width="220" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">list interface, key name</text>
<rect x="20" y="200" width="130" height="36" rx="8" fill="#fde68a"/><text x="85" y="223" text-anchor="middle" class="svg-ink" font-size="12">leaf name</text>
<rect x="165" y="200" width="140" height="36" rx="8" fill="#fde68a"/><text x="235" y="223" text-anchor="middle" class="svg-ink" font-size="12">leaf description</text>
<rect x="320" y="200" width="130" height="36" rx="8" fill="#fde68a"/><text x="385" y="223" text-anchor="middle" class="svg-ink" font-size="12">leaf enabled</text>
<rect x="465" y="200" width="160" height="36" rx="8" fill="#fed7aa"/><text x="545" y="223" text-anchor="middle" class="svg-ink" font-size="12">ipv4 (augment)</text>
<line x1="320" y1="46" x2="320" y2="70" stroke="#64748b"/><line x1="320" y1="106" x2="320" y2="130" stroke="#64748b"/>
<line x1="320" y1="166" x2="85" y2="200" stroke="#64748b"/><line x1="320" y1="166" x2="235" y2="200" stroke="#64748b"/><line x1="320" y1="166" x2="385" y2="200" stroke="#64748b"/><line x1="320" y1="166" x2="545" y2="200" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="545" y="252" text-anchor="middle" class="svg-accent" font-size="12">added by ietf-ip</text>
</svg><p class="cap">Module, container, list with a key, leaves, and an augmented branch from another module.</p></div>

<h3>A small YANG snippet, read line by line</h3>
<pre class="code">container vlan {
  list vlan-list {
    key "id";                         <span class="c">// each entry is found by id</span>
    leaf id   { type uint16 { range "2..4094"; } }
    leaf name { type string { length "1..32"; } }
  }
}</pre>
<p>This says: there is one <code>vlan</code> container; inside it a list <code>vlan-list</code>; each entry has an <code>id</code> that is an unsigned 16-bit number and optionally a <code>name</code> string. That is exactly the model Lab 2 uses on DSW1. Because <code>id</code> is <code>uint16</code>, JSON must send it as a <b>number</b> (<code>30</code>), not a string (<code>"30"</code>). Because the key is called <code>id</code>, a JSON member named <code>vlan_id</code> is unknown. Both mistakes appear in the lab file <code>vlan30.json</code>, and the YANG model is how you prove them.</p>

<div class="eg"><p><b>Worked example.</b> A valid instance of the model above, in JSON: <code>{"nk-native:vlan-list": [{"id": 30, "name": "VOICE"}]}</code>. In XML: <code>&lt;vlan-list&gt;&lt;id&gt;30&lt;/id&gt;&lt;name&gt;VOICE&lt;/name&gt;&lt;/vlan-list&gt;</code> inside <code>&lt;vlan xmlns="urn:nk:yang:nk-native"&gt;</code>. Same data, two encodings, one model. VLAN 5000 would be rejected by the range before it ever reaches the configuration.</p></div>

<h3>Built-in types worth knowing</h3>
<p><code>string</code>, <code>boolean</code>, <code>int8</code> to <code>int64</code>, <code>uint8</code> to <code>uint64</code>, <code>decimal64</code>, <code>enumeration</code> (a fixed set of names such as up/down), <code>identityref</code> (a named identity such as <code>iana-if-type:softwareLoopback</code>), <code>union</code> (one of several types), <code>leafref</code> (a pointer to another leaf, for example an interface name that must exist), <code>empty</code> and <code>bits</code>. Common typedefs come from ietf-inet-types (<code>inet:ipv4-address</code>) and ietf-yang-types (<code>yang:counter64</code>).</p>

<div class="warn"><p><b>Common mistake.</b> Treating a list key as optional. Every list entry you create must include its key leaf, and in RESTCONF the key in the body must match the key in the URI. Missing keys give <code>missing-element</code>; mismatched keys give <code>invalid-value</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> A <b>container</b> holds nodes and appears once; a <b>list</b> has entries identified by a key; a <b>leaf-list</b> holds simple values with no key. <b>augment</b> adds to another module; <b>grouping/uses</b> reuses nodes; <b>typedef</b> reuses a type. Questions swap these words.</p></div>

<div class="scn"><h4>The VLAN that would not take</h4><p>A developer wrote a script that posted VLANs as <code>{"vlan_id": "300"}</code> because that is how the IPAM database named the field. Every call failed with 400. The network engineer opened the model, showed the list key was <code>id</code> of type <code>uint16</code>, and the script was changed to map <code>vlan_id</code> to <code>id</code> and send a number.</p><p><b>Lesson:</b> the YANG model, not the database or your guess, defines the names and types of the payload.</p></div>

<div class="iv"><p class="q">"What is the difference between a container, a list and a leaf in YANG?"</p><p>Strong answer: a container groups nodes and occurs once; a list holds multiple entries of the same structure, each identified by a key leaf; a leaf is a single typed value with no children, and a leaf-list is a set of simple values. Give the ietf-interfaces example: container interfaces, list interface keyed by name, leaf description. Bonus: mention config false for state data and augment for extending another model.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG (RFC 7950) models configuration, state, RPCs and notifications; it is protocol-independent.</li>
<li>Module header: name, namespace (unique URN), prefix, imports, revision.</li>
<li>container = once; list = many entries with a key; leaf = one typed value; leaf-list = simple values.</li>
<li>typedef reuses types, grouping/uses reuses nodes, augment extends another module.</li>
<li>config false marks read-only operational state; types and ranges are enforced before the change is applied.</li>
</ul></div>
`,hi:`
<p>Ek filing cabinet socho. Cabinet par ek label hai (<b>module</b>), drawers hain jinme related folders hain (<b>containers</b>), ek drawer mein ek jaise folders hain jo tab ke naam se sorted hain (ek <b>list</b> jiski <b>key</b> hai), aur har folder par boxes mein single facts likhe hain (<b>leaves</b>). YANG bas woh language hai jisse is cabinet ko describe kiya jaata hai taaki har program maane ki har fact kahan hai aur uska type kya hai.</p>

<h3>YANG kya hai</h3>
<p><b>YANG</b> (Yet Another Next Generation) ek <b>data modelling language</b> hai jo RFC 6020 (version 1) aur <b>RFC 7950</b> (version 1.1) mein define hai. Yeh device ki configuration aur operational state describe karti hai, saath mein RPCs (actions) aur notifications (events). YANG khud kabhi device ko nahi bheji jaati; yeh woh contract hai jise aapka bheja XML ya JSON follow karna chahiye. Iske fayde, jo exam describe karne ko kehta hai: yeh <b>human-readable</b> hai par precise, data ki tarah hi <b>hierarchical</b>, constraints (ranges, patterns, mandatory) ke saath strongly <b>typed</b>, typedefs aur groupings se <b>reusable</b>, augment se <b>extensible</b>, aur <b>protocol-independent</b> (same model NETCONF, RESTCONF aur gNMI ko serve karta hai).</p>

<h3>Module header</h3>
<pre class="code">module nk-native {
  yang-version 1.1;
  namespace "urn:nk:yang:nk-native";   <span class="c">// globally unique naam, XML mein use hota hai</span>
  prefix nk;                            <span class="c">// YANG files ke andar use hone wala chhota alias</span>
  import ietf-inet-types { prefix inet; }
  revision 2026-01-15 { description "Initial lab model"; }
  ...
}</pre>
<p><b>Namespace</b> ek URN hai jo har node ko globally unique banata hai; NETCONF XML mein yeh hona chahiye (<code>xmlns="urn:ietf:params:xml:ns:yang:ietf-interfaces"</code>). <b>Prefix</b> ek chhota alias hai jo tab use hota hai jab ek module doosre ko refer karta hai. <b>Revision</b> date version pehchanti hai; devices apni capabilities mein module plus revision advertise karte hain. Ek <b>submodule</b> bade module ko files mein baant sakta hai.</p>

<h3>Node types</h3>
<dl class="terms">
<dt>container</dt><dd>Related nodes ko group karta hai aur zyada se zyada ek baar aata hai, drawer ki tarah. <code>interfaces</code> ek container hai. <b>Presence container</b> sirf exist karke hi kuch matlab rakhta hai (tree mein <code>!</code> se dikhta hai).</dd>
<dt>list</dt><dd>Same structure wali kai entries. Har entry ek ya zyada <b>key</b> leaves se pehchani jaati hai. <code>list interface { key "name"; ... }</code> ka matlab har interface entry apne naam se milti hai.</dd>
<dt>leaf</dt><dd>Type wali ek single value: <code>leaf description { type string; }</code>, <code>leaf enabled { type boolean; default true; }</code>. Leaves ke children nahi hote.</dd>
<dt>leaf-list</dt><dd>Ek type ki simple values ki list, bina key: jaise kai DNS server addresses ya NTP servers.</dd>
<dt>typedef</dt><dd>Ek naam wala, reusable type jo base type par restrictions ke saath bana hai: <code>typedef vlan-id { type uint16 { range "1..4094"; } }</code>.</dd>
<dt>grouping / uses</dt><dd>Nodes ka reusable block jo <code>grouping</code> se ek baar define hota hai aur jahan <code>uses</code> aaye wahan copy hota hai; template paragraph ki tarah.</dd>
<dt>augment</dt><dd>Ek module doosre module ke tree mein bina use edit kiye nodes jodta hai. ietf-ip <code>/if:interfaces/if:interface</code> ko <code>ipv4</code> aur <code>ipv6</code> se augment karta hai.</dd>
<dt>choice / case</dt><dd>Mutually exclusive alternatives: ek address mein ya to <code>prefix-length</code> hota hai ya <code>netmask</code>.</dd>
<dt>config false</dt><dd>Operational state mark karta hai (counters, oper-status, neighbour counts): read-only data jise aap GET kar sakte ho par kabhi likh nahi sakte.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 260" role="img" aria-label="YANG hierarchy">
<rect x="230" y="10" width="180" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">module ietf-interfaces</text>
<rect x="230" y="70" width="180" height="36" rx="8" fill="#bae6fd"/><text x="320" y="93" text-anchor="middle" class="svg-ink" font-size="13">container interfaces</text>
<rect x="210" y="130" width="220" height="36" rx="8" fill="#bbf7d0"/><text x="320" y="153" text-anchor="middle" class="svg-ink" font-size="13">list interface, key name</text>
<rect x="20" y="200" width="130" height="36" rx="8" fill="#fde68a"/><text x="85" y="223" text-anchor="middle" class="svg-ink" font-size="12">leaf name</text>
<rect x="165" y="200" width="140" height="36" rx="8" fill="#fde68a"/><text x="235" y="223" text-anchor="middle" class="svg-ink" font-size="12">leaf description</text>
<rect x="320" y="200" width="130" height="36" rx="8" fill="#fde68a"/><text x="385" y="223" text-anchor="middle" class="svg-ink" font-size="12">leaf enabled</text>
<rect x="465" y="200" width="160" height="36" rx="8" fill="#fed7aa"/><text x="545" y="223" text-anchor="middle" class="svg-ink" font-size="12">ipv4 (augment)</text>
<line x1="320" y1="46" x2="320" y2="70" stroke="#64748b"/><line x1="320" y1="106" x2="320" y2="130" stroke="#64748b"/>
<line x1="320" y1="166" x2="85" y2="200" stroke="#64748b"/><line x1="320" y1="166" x2="235" y2="200" stroke="#64748b"/><line x1="320" y1="166" x2="385" y2="200" stroke="#64748b"/><line x1="320" y1="166" x2="545" y2="200" stroke="#64748b" stroke-dasharray="4 4"/>
<text x="545" y="252" text-anchor="middle" class="svg-accent" font-size="12">ietf-ip ne joda</text>
</svg><p class="cap">Module, container, key wali list, leaves, aur doosre module se augment hui branch.</p></div>

<h3>Ek chhota YANG snippet, line by line</h3>
<pre class="code">container vlan {
  list vlan-list {
    key "id";                         <span class="c">// har entry id se milti hai</span>
    leaf id   { type uint16 { range "2..4094"; } }
    leaf name { type string { length "1..32"; } }
  }
}</pre>
<p>Iska matlab: ek <code>vlan</code> container hai; uske andar ek list <code>vlan-list</code>; har entry ka ek <code>id</code> hai jo unsigned 16-bit number hai aur optional <code>name</code> string. Yahi model Lab 2 DSW1 par use karta hai. Kyunki <code>id</code> <code>uint16</code> hai, JSON ko ise <b>number</b> (<code>30</code>) ki tarah bhejna hoga, string (<code>"30"</code>) ki tarah nahi. Kyunki key ka naam <code>id</code> hai, <code>vlan_id</code> naam ka JSON member unknown hai. Dono galtiyan lab file <code>vlan30.json</code> mein hain, aur YANG model se hi aap unhe prove karte ho.</p>

<div class="eg"><p><b>Worked example.</b> Upar wale model ka ek valid instance, JSON mein: <code>{"nk-native:vlan-list": [{"id": 30, "name": "VOICE"}]}</code>. XML mein: <code>&lt;vlan xmlns="urn:nk:yang:nk-native"&gt;</code> ke andar <code>&lt;vlan-list&gt;&lt;id&gt;30&lt;/id&gt;&lt;name&gt;VOICE&lt;/name&gt;&lt;/vlan-list&gt;</code>. Same data, do encodings, ek model. VLAN 5000 configuration tak pahunchne se pehle hi range se reject ho jaayega.</p></div>

<h3>Jaanne layak built-in types</h3>
<p><code>string</code>, <code>boolean</code>, <code>int8</code> se <code>int64</code>, <code>uint8</code> se <code>uint64</code>, <code>decimal64</code>, <code>enumeration</code> (naamon ka fixed set jaise up/down), <code>identityref</code> (ek named identity jaise <code>iana-if-type:softwareLoopback</code>), <code>union</code> (kai types mein se ek), <code>leafref</code> (doosri leaf ka pointer, jaise interface naam jo exist karna chahiye), <code>empty</code> aur <code>bits</code>. Common typedefs ietf-inet-types (<code>inet:ipv4-address</code>) aur ietf-yang-types (<code>yang:counter64</code>) se aate hain.</p>

<div class="warn"><p><b>Common galti.</b> List key ko optional samajhna. Aap jo bhi list entry banao, usme key leaf honi chahiye, aur RESTCONF mein body ki key URI ki key se match honi chahiye. Missing keys <code>missing-element</code> deti hain; mismatched keys <code>invalid-value</code>.</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Container</b> nodes rakhta hai aur ek baar aata hai; <b>list</b> ki entries key se pehchani jaati hain; <b>leaf-list</b> bina key ki simple values rakhti hai. <b>augment</b> doosre module mein jodta hai; <b>grouping/uses</b> nodes reuse karta hai; <b>typedef</b> type reuse karta hai. Questions in shabdon ko ulat dete hain.</p></div>

<div class="scn"><h4>VLAN jo ban hi nahi raha tha</h4><p>Ek developer ne script likhi jo VLANs ko <code>{"vlan_id": "300"}</code> ki tarah post karti thi kyunki IPAM database mein field ka naam yahi tha. Har call 400 ke saath fail hoti thi. Network engineer ne model khola, dikhaya ki list key <code>id</code> hai jiska type <code>uint16</code> hai, aur script badli gayi taaki <code>vlan_id</code> ko <code>id</code> par map kare aur number bheje.</p><p><b>Seekh:</b> payload ke naam aur types YANG model define karta hai, na database, na aapka guess.</p></div>

<div class="iv"><p class="q">"YANG mein container, list aur leaf mein kya fark hai?"</p><p>Strong answer: container nodes ko group karta hai aur ek baar aata hai; list same structure ki kai entries rakhti hai, har entry ek key leaf se pehchani jaati hai; leaf ek typed value hai jiske children nahi hote, aur leaf-list simple values ka set hai. ietf-interfaces ka example do: container interfaces, name se keyed list interface, leaf description. Bonus: state data ke liye config false aur doosre model ko extend karne ke liye augment batao.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>YANG (RFC 7950) configuration, state, RPCs aur notifications model karti hai; yeh protocol-independent hai.</li>
<li>Module header: naam, namespace (unique URN), prefix, imports, revision.</li>
<li>container = ek baar; list = key wali kai entries; leaf = ek typed value; leaf-list = simple values.</li>
<li>typedef types reuse karta hai, grouping/uses nodes reuse karta hai, augment doosre module ko extend karta hai.</li>
<li>config false read-only operational state mark karta hai; types aur ranges change apply hone se pehle enforce hote hain.</li>
</ul></div>
`}};export{e as default};