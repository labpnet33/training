var e={id:`yang-data`,h:{en:`YANG-modelled data and XPath paths`,hi:`YANG-modelled data aur XPath paths`},body:{en:`
<p><b>One idea:</b> telemetry is only useful if both sides agree what a number <i>means</i>. A <b>YANG model</b> is the agreement. It describes the exact names, types and structure of the data a device holds, so the collector never has to guess whether <code>in-octets</code> is bytes, packets or something else. (The <i>encor-yang</i> module teaches YANG syntax and NETCONF; here we use models to choose <i>what</i> to stream.)</p>
<h3>Analogy: a form with labelled boxes</h3>
<p>A YANG model is like a printed form. Each box has a fixed label (<i>name</i>, <i>status</i>, <i>received bytes</i>) and a fixed kind of answer (text, yes or no, a number). Everyone who receives a filled-in form can read it the same way. Telemetry sends thousands of filled-in forms per minute.</p>
<h3>Containers, lists and leaves</h3>
<ul><li>A <b>leaf</b> holds one value, such as <code>in-octets</code>.</li><li>A <b>container</b> groups related nodes, such as <code>counters</code>.</li><li>A <b>list</b> has many entries told apart by a <b>key</b>, such as <code>interface</code> keyed by <code>name</code>.</li><li><b>Config</b> data (<code>rw</code>) is what you set; <b>operational state</b> (<code>ro</code>) is what the device reports. Telemetry mostly streams operational state.</li></ul>
<p>A tool called <code>pyang</code> prints a model as a tree. This is an excerpt of the OpenConfig interfaces model, shown so you can read the shape (not captured from the simulator):</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
module: openconfig-interfaces
  +--rw interfaces
     +--rw interface* [name]
        +--rw name           -&gt; ../config/name
        +--rw config
        |  +--rw name?          string
        |  +--rw enabled?       boolean
        +--ro state
           +--ro name?          string
           +--ro oper-status?   enumeration
           +--ro counters
              +--ro in-octets?   oc-yang:counter64
              +--ro in-errors?   oc-yang:counter64</pre>
<p>Read it from the top. <code>interfaces</code> is a container. <code>interface*</code> is a list (the star), with <code>[name]</code> as its key. Under each interface there is <code>config</code> (read-write) and <code>state</code> (read-only), and under state a <code>counters</code> container with leaves like <code>in-octets</code>. The question mark means the leaf is optional. The type <code>counter64</code> tells you it is a 64-bit counter, which avoids the wrap problem from the previous chapter.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module openconfig-interfaces to Container interfaces to List interface [name] to Leaf in-octets"><rect x="20" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Module</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">openconfig-interfaces</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Container</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">interfaces</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">List</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">interface [name]</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Leaf</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">in-octets</text></svg><p class="cap">An XPath is just the route through this tree, from the module down to the nodes you want.</p></div>
<h3>XPath: the address of the data</h3>
<p>To subscribe you must name the data. The common way is an <b>XPath</b>: slash-separated names from the module down. Examples (reference only):</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
/openconfig-interfaces:interfaces/interface/state/counters
/openconfig-interfaces:interfaces/interface[name='GigabitEthernet1']/state/counters
/interfaces-ios-xe-oper:interfaces/interface/statistics
/Cisco-IOS-XE-process-cpu-oper:cpu-usage/cpu-utilization/five-seconds</pre>
<ul><li>The part before the colon is the <b>module name</b> (<code>openconfig-interfaces</code>). The first name after the slash needs it; deeper names inherit it.</li><li>With no filter, the path covers <b>all list entries</b> (every interface). The <code>[name='GigabitEthernet1']</code> predicate selects one. Streaming everything costs more on both ends, so filter when you can.</li><li><b>Vendor-native</b> models (for example the <code>Cisco-IOS-XE-...-oper</code> family) expose more detail; <b>OpenConfig</b> and <b>IETF</b> models are vendor-neutral. A multi-vendor network prefers OpenConfig where the platform supports it.</li></ul>
<h3>What a received message looks like</h3>
<p>The collector receives structured data, often as JSON or a compact binary form (next chapters). The code below parses a <b>sample</b> message whose values are made up, so you can see how a script extracts one number. <code>json.loads</code> converts JSON text into a Python dictionary; square brackets read a label; <code>sorted()</code> lists the labels alphabetically.</p>
<pre class="code">import json

<span class="c"># A SAMPLE message with made-up values, shaped like a model-driven telemetry update.</span>
sample = """
{
  "path": "openconfig-interfaces:interfaces/interface/state/counters",
  "timestamp": 1760000000,
  "keys": {"name": "GigabitEthernet1"},
  "content": {"in-octets": 5120000, "out-octets": 2048000, "in-errors": 0}
}
"""

data = json.loads(sample)              # text -&gt; Python dictionary
print("interface:", data["keys"]["name"])
print("in-octets:", data["content"]["in-octets"])
print("fields in content:", sorted(data["content"]))</pre>
<pre class="out">interface: GigabitEthernet1
in-octets: 5120000
fields in content: ['in-errors', 'in-octets', 'out-octets']</pre>
<div class="warn"><p><b>Common mistake.</b> Typing a path from memory. A wrong module name or a leaf that does not exist gives an invalid subscription or silently empty data. Look the path up in the model (<code>pyang</code> tree, or the platform's YANG catalogue) before you use it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know the difference between <b>config</b> and <b>state</b> data, that telemetry normally subscribes to state, and that an XPath filter without a key predicate returns every list entry. Also know that OpenConfig and IETF models are vendor-neutral.</p></div>
<div class="eg"><p><b>Worked example.</b> You want input errors on one uplink only. Path: <code>/openconfig-interfaces:interfaces/interface[name='GigabitEthernet1']/state/counters</code>. The collector then sees a few leaves for one interface instead of a message for all 48.</p></div>
<div class="scn"><h4>Two vendors, one dashboard</h4><p>A bank ran two router vendors. With vendor-native paths, the team needed two sets of dashboards because field names differed. After moving interface counters to the OpenConfig interfaces model on both, a single dashboard query worked everywhere. Vendor-native paths were kept only for platform-specific data such as hardware sensors.</p><p><b>Lesson:</b> Use a vendor-neutral model where it exists.</p></div>
<div class="iv"><p class="q">"What is YANG and why does streaming telemetry depend on it?"</p><p>YANG is the modelling language that defines the structure, types and meaning of data on a device: containers, lists, leaves, and whether data is config or operational state. Model-driven telemetry streams data defined by those models and names it with a path, so the collector knows exactly what each field is. This makes data self-describing and portable across tools.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A YANG model fixes names, types and structure; leaves hold values, containers group, lists have keys.</li><li><code>rw</code> is config; <code>ro</code> is operational state, which telemetry mostly streams.</li><li>An XPath names the data: module, then slash-separated nodes, with optional key predicates.</li><li>Filter to the data you need; unfiltered list paths return every entry.</li><li>Prefer OpenConfig or IETF models for multi-vendor networks.</li></ul></div>
`,hi:`
<p><b>Ek idea:</b> telemetry tabhi kaam ki hai jab dono taraf agree ho ki ek number ka <i>matlab</i> kya hai. <b>YANG model</b> wahi agreement hai. Yeh device ke data ke exact naam, types aur structure describe karta hai, isliye collector ko andaza nahi lagana padta ki <code>in-octets</code> bytes hai, packets hai ya kuch aur. (<i>encor-yang</i> module YANG syntax aur NETCONF sikhata hai; yahan hum models se yeh chunte hain ki <i>kya</i> stream karna hai.)</p>
<h3>Analogy: labelled boxes wala form</h3>
<p>YANG model ek chhape hue form jaisa hai. Har box ka fixed label hai (<i>name</i>, <i>status</i>, <i>received bytes</i>) aur fixed kism ka jawab (text, haan ya na, number). Jo bhi bhara hua form receive karta hai woh use ek hi tarah padh sakta hai. Telemetry har minute hazaaron bhare hue forms bhejti hai.</p>
<h3>Containers, lists aur leaves</h3>
<ul><li><b>Leaf</b> ek value rakhta hai, jaise <code>in-octets</code>.</li><li><b>Container</b> related nodes ko group karta hai, jaise <code>counters</code>.</li><li><b>List</b> mein kai entries hoti hain jo <b>key</b> se alag pehchani jaati hain, jaise <code>interface</code> jiski key <code>name</code> hai.</li><li><b>Config</b> data (<code>rw</code>) woh hai jo aap set karte ho; <b>operational state</b> (<code>ro</code>) woh hai jo device report karta hai. Telemetry zyadatar operational state stream karti hai.</li></ul>
<p><code>pyang</code> naam ka tool model ko tree ki tarah print karta hai. Yeh OpenConfig interfaces model ka excerpt hai, taaki aap shape padh sako (simulator se capture nahi kiya):</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
module: openconfig-interfaces
  +--rw interfaces
     +--rw interface* [name]
        +--rw name           -&gt; ../config/name
        +--rw config
        |  +--rw name?          string
        |  +--rw enabled?       boolean
        +--ro state
           +--ro name?          string
           +--ro oper-status?   enumeration
           +--ro counters
              +--ro in-octets?   oc-yang:counter64
              +--ro in-errors?   oc-yang:counter64</pre>
<p>Ise upar se padho. <code>interfaces</code> container hai. <code>interface*</code> list hai (star), jiski key <code>[name]</code> hai. Har interface ke neeche <code>config</code> (read-write) aur <code>state</code> (read-only) hai, aur state ke neeche <code>counters</code> container hai jisme <code>in-octets</code> jaise leaves hain. Question mark ka matlab leaf optional hai. Type <code>counter64</code> batata hai ki yeh 64-bit counter hai, jo pichhle chapter ke wrap problem se bachata hai.</p>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Module openconfig-interfaces to Container interfaces to List interface [name] to Leaf in-octets"><rect x="20" y="40" width="124" height="76" rx="10" fill="#ddd6fe"/><text x="82" y="74" text-anchor="middle" class="svg-ink" font-size="13">Module</text><text x="82" y="90" text-anchor="middle" class="svg-muted" font-size="12">openconfig-interfaces</text><line x1="144" y1="78" x2="174" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="178,78 170,73 170,83" fill="#64748b"/><rect x="178" y="40" width="124" height="76" rx="10" fill="#bae6fd"/><text x="240" y="74" text-anchor="middle" class="svg-ink" font-size="13">Container</text><text x="240" y="90" text-anchor="middle" class="svg-muted" font-size="12">interfaces</text><line x1="302" y1="78" x2="332" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="336,78 328,73 328,83" fill="#64748b"/><rect x="336" y="40" width="124" height="76" rx="10" fill="#fde68a"/><text x="398" y="74" text-anchor="middle" class="svg-ink" font-size="13">List</text><text x="398" y="90" text-anchor="middle" class="svg-muted" font-size="12">interface [name]</text><line x1="460" y1="78" x2="490" y2="78" stroke="#64748b" stroke-width="2"/><polygon points="494,78 486,73 486,83" fill="#64748b"/><rect x="494" y="40" width="124" height="76" rx="10" fill="#bbf7d0"/><text x="556" y="74" text-anchor="middle" class="svg-ink" font-size="13">Leaf</text><text x="556" y="90" text-anchor="middle" class="svg-muted" font-size="12">in-octets</text></svg><p class="cap">XPath bas is tree mein se guzarne wala raasta hai, module se un nodes tak jo aap chahte ho.</p></div>
<h3>XPath: data ka address</h3>
<p>Subscribe karne ke liye data ka naam batana padta hai. Aam tareeka <b>XPath</b> hai: module se neeche tak slash se alag naam. Examples (sirf reference):</p>
<pre class="code"><span class="c"># Reference code (not run in the simulator)</span>
/openconfig-interfaces:interfaces/interface/state/counters
/openconfig-interfaces:interfaces/interface[name='GigabitEthernet1']/state/counters
/interfaces-ios-xe-oper:interfaces/interface/statistics
/Cisco-IOS-XE-process-cpu-oper:cpu-usage/cpu-utilization/five-seconds</pre>
<ul><li>Colon ke pehle ka hissa <b>module name</b> hai (<code>openconfig-interfaces</code>). Slash ke baad pehle naam ko iski zaroorat hai; gehre naam ise inherit karte hain.</li><li>Filter na ho to path <b>list ki saari entries</b> cover karta hai (har interface). <code>[name='GigabitEthernet1']</code> predicate ek ko chunta hai. Sab kuch stream karna dono taraf zyada mehnga padta hai, isliye jab ho sake filter karo.</li><li><b>Vendor-native</b> models (jaise <code>Cisco-IOS-XE-...-oper</code> family) zyada detail dete hain; <b>OpenConfig</b> aur <b>IETF</b> models vendor-neutral hain. Multi-vendor network jahan platform support kare wahan OpenConfig prefer karta hai.</li></ul>
<h3>Receive hua message kaisa dikhta hai</h3>
<p>Collector ko structured data milta hai, aksar JSON ya compact binary form mein (agle chapters). Neeche ka code ek <b>sample</b> message parse karta hai jiski values made-up hain, taaki aap dekh sako ki script ek number kaise nikalti hai. <code>json.loads</code> JSON text ko Python dictionary mein badalta hai; square brackets label padhte hain; <code>sorted()</code> labels ko alphabetical list karta hai.</p>
<pre class="code">import json

<span class="c"># A SAMPLE message with made-up values, shaped like a model-driven telemetry update.</span>
sample = """
{
  "path": "openconfig-interfaces:interfaces/interface/state/counters",
  "timestamp": 1760000000,
  "keys": {"name": "GigabitEthernet1"},
  "content": {"in-octets": 5120000, "out-octets": 2048000, "in-errors": 0}
}
"""

data = json.loads(sample)              # text -&gt; Python dictionary
print("interface:", data["keys"]["name"])
print("in-octets:", data["content"]["in-octets"])
print("fields in content:", sorted(data["content"]))</pre>
<pre class="out">interface: GigabitEthernet1
in-octets: 5120000
fields in content: ['in-errors', 'in-octets', 'out-octets']</pre>
<div class="warn"><p><b>Aam galti.</b> Path yaad se type karna. Galat module name ya aisa leaf jo exist nahi karta invalid subscription ya chupchaap khaali data deta hai. Use karne se pehle path ko model mein dekho (<code>pyang</code> tree, ya platform ka YANG catalogue).</p></div>
<div class="exam"><p><b>Exam trap.</b> <b>Config</b> aur <b>state</b> data ka fark jaano, ki telemetry aam taur par state subscribe karti hai, aur key predicate ke bina XPath filter list ki har entry deta hai. Yeh bhi jaano ki OpenConfig aur IETF models vendor-neutral hain.</p></div>
<div class="eg"><p><b>Worked example.</b> Aapko sirf ek uplink ke input errors chahiye. Path: <code>/openconfig-interfaces:interfaces/interface[name='GigabitEthernet1']/state/counters</code>. Collector ko tab 48 interfaces ke message ki jagah ek interface ke kuch leaves milte hain.</p></div>
<div class="scn"><h4>Do vendors, ek dashboard</h4><p>Ek bank mein do router vendors the. Vendor-native paths ke saath team ko do dashboards chahiye the kyunki field names alag the. Dono par interface counters ko OpenConfig interfaces model par le jaane ke baad ek hi dashboard query sab jagah chali. Vendor-native paths sirf platform-specific data, jaise hardware sensors, ke liye rakhe gaye.</p><p><b>Lesson:</b> Jahan vendor-neutral model hai wahan use karo.</p></div>
<div class="iv"><p class="q">"YANG kya hai aur streaming telemetry us par kyun depend karti hai?"</p><p>YANG modelling language hai jo device ke data ka structure, types aur matlab define karti hai: containers, lists, leaves, aur data config hai ya operational state. Model-driven telemetry unhi models se define data stream karti hai aur use path se naam deti hai, isliye collector ko pata hota hai ki har field kya hai. Isse data self-describing aur tools ke beech portable ban jaata hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>YANG model naam, types aur structure fix karta hai; leaves values rakhte hain, containers group karte hain, lists mein keys hoti hain.</li><li><code>rw</code> config hai; <code>ro</code> operational state hai, jise telemetry zyadatar stream karti hai.</li><li>XPath data ka naam deta hai: module, phir slash se alag nodes, optional key predicates ke saath.</li><li>Jo data chahiye wahi filter karo; unfiltered list paths har entry dete hain.</li><li>Multi-vendor networks ke liye OpenConfig ya IETF models prefer karo.</li></ul></div>
`}};export{e as default};