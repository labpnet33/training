var e={id:`structured`,h:{en:`Structured output on NX-OS: | json, | json-pretty and | xml`,hi:`NX-OS par structured output: | json, | json-pretty aur | xml`},body:{en:`
<p>Picture two restaurant bills. One is a crumpled paper with prices scribbled in the margin. The other is an itemised receipt where every line has a name, a quantity and a price in fixed boxes. An accountant can type the second into a spreadsheet in seconds. NX-OS can give you both kinds of bill for almost every show command: the normal text for your eyes, and a <b>structured</b> version for programs. This chapter teaches you to ask for the structured version and to read it, which is the first task of Lab 1.</p>

<h3>The three pipes</h3>
<p>On NX-OS you add a pipe at the end of a show command to change its output format:</p>
<ul>
<li><code>| json</code> returns compact JSON on one long line. Best for programs.</li>
<li><code>| json-pretty</code> returns the same JSON indented over many lines. Best for humans who want to find key names.</li>
<li><code>| xml</code> returns the data as XML, wrapped in a NETCONF-style reply.</li>
</ul>
<p>The content is identical in all three; only the formatting changes. Structured output is produced by the same code that NX-API uses, so the key names you discover here are exactly the keys your scripts and API calls will receive.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="From show command to program">
<rect x="10" y="30" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">show vlan brief</text>
<rect x="240" y="10" width="160" height="36" rx="8" fill="#fed7aa"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">text: for eyes</text>
<rect x="240" y="60" width="160" height="36" rx="8" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="13">| json: for code</text>
<rect x="240" y="110" width="160" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">| xml: for code</text>
<rect x="470" y="60" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="550" y="83" text-anchor="middle" class="svg-ink" font-size="13">Python dict</text>
<line x1="170" y1="52" x2="240" y2="28" stroke="#64748b" stroke-width="2"/><line x1="170" y1="52" x2="240" y2="78" stroke="#64748b" stroke-width="2"/><line x1="170" y1="52" x2="240" y2="128" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="78" x2="470" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="435" y="68" text-anchor="middle" class="svg-muted" font-size="12">json.loads</text>
</svg><p class="cap">One command, three views. Programs should always read the structured view.</p></div>

<h3>Reading show version as JSON</h3>
<p>Compare the familiar text with its JSON form. The chassis serial number, which in text is buried in a sentence ("Processor Board ID ..."), becomes a clean key called <code>proc_board_id</code>.</p>
<pre class="code">LEAF1# show version | json-pretty</pre>
<pre class="out">{
    "bios_ver_str": "05.47",
    "nxos_ver_str": "10.4(3)",
    "host_name": "LEAF1",
    "chassis_id": "Nexus9000 C93180YC-FX Chassis",
    "cpu_name": "Intel(R) Xeon(R) CPU D-1528 @ 1.90GHz",
    "memory": 24632252,
    "mem_type": "kB",
    <span class="hl">"proc_board_id": "FDO23460ABC",</span>
    "kern_uptm_days": 12,
    "rr_reason": "Reset Requested by CLI command reload",
    ...
}</pre>
<p>In Lab 1, run <code>show version</code> first and find the "Processor Board ID" line, then run <code>show version | json-pretty</code> and find <code>proc_board_id</code>. They show the same serial; your lab switch has its own value, so copy it from your screen.</p>

<h3>Tables become TABLE_ and ROW_ keys</h3>
<p>Many show commands print a table. In JSON, NX-OS wraps a table in a key that starts with <code>TABLE_</code>, and each line of the table becomes an entry in a key that starts with <code>ROW_</code>. The column headings become keys inside each row.</p>
<pre class="code">LEAF1# show vlan brief | json-pretty</pre>
<pre class="out">{
    "TABLE_vlanbriefxbrief": {
        "ROW_vlanbriefxbrief": [
            { "vlanshowbr-vlanid": 1,  "vlanshowbr-vlanname": "default", "vlanshowbr-vlanstate": "active" },
            { "vlanshowbr-vlanid": 10, "vlanshowbr-vlanname": "WEB",     "vlanshowbr-vlanstate": "active" },
            { "vlanshowbr-vlanid": 20, "vlanshowbr-vlanname": "DB",      "vlanshowbr-vlanstate": "active" },
            <span class="hl">{ "vlanshowbr-vlanid": 30, "vlanshowbr-vlanname": "APP",     "vlanshowbr-vlanstate": "active" }</span>
        ]
    }
}</pre>
<p>(Real output has a few more keys per row, such as the port list; they are trimmed here.) The same pattern appears everywhere: <code>show interface brief | json</code> gives <code>TABLE_interface</code> and <code>ROW_interface</code> with keys such as <code>interface</code>, <code>state</code>, <code>vlan</code> and <code>speed</code>; <code>show ip ospf neighbors | json</code> has its own TABLE and ROW names. You do not memorise them; you discover them with <code>| json-pretty</code>.</p>

<h3>The same data as XML</h3>
<pre class="code">LEAF1# show version | xml</pre>
<pre class="out">&lt;?xml version="1.0" encoding="ISO-8859-1"?&gt;
&lt;nf:rpc-reply xmlns:nf="urn:ietf:params:xml:ns:netconf:base:1.0" ...&gt;
 &lt;nf:data&gt;
  &lt;show&gt; &lt;version&gt; ...
     <span class="hl">&lt;proc_board_id&gt;FDO23460ABC&lt;/proc_board_id&gt;</span>
  ...
&lt;/nf:rpc-reply&gt;</pre>
<p>XML output is more verbose and wrapped in extra layers, which is why most modern scripts prefer JSON.</p>

<h3>Parsing it with Python</h3>
<p>Once output is JSON, a few lines of Python turn it into a report. The script below reads a saved <code>show vlan brief | json</code> result and prints each VLAN.</p>
<pre class="code">import json

with open('leaf1_vlans.json') as f:
    data = json.load(f)

rows = data['TABLE_vlanbriefxbrief']['ROW_vlanbriefxbrief']
if isinstance(rows, dict):          <span class="c"># only one VLAN? NX-OS returns one object, not a list</span>
    rows = [rows]

for row in rows:
    print(row['vlanshowbr-vlanid'], row['vlanshowbr-vlanname'])</pre>
<pre class="out">1 default
10 WEB
20 DB
<span class="hl">30 APP</span></pre>

<div class="eg"><p><b>Worked example: the single-row trap.</b> A leaf with VLANs 1, 10, 20 and 30 returns <code>ROW_vlanbriefxbrief</code> as a <b>list</b> of 4 objects. A brand-new switch with only VLAN 1 returns <code>ROW_vlanbriefxbrief</code> as <b>one object</b>, not a list of 1. A loop written for lists would then iterate over the keys of that object and print nonsense or crash. The two-line <code>isinstance</code> check above makes the script work for 1 row and for 4,000 rows.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Guessing key names instead of checking them with <code>| json-pretty</code>. Forgetting the single-row case described above. Assuming every command supports JSON: some older or platform-specific commands do not, and return an error instead of data. Treating numbers as strings or the reverse; compare values with the right type.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>| json</code> and <code>| xml</code> are the on-box way to get structured output; NX-API <code>cli_show</code> is the remote way to get the same JSON. Tables appear as <code>TABLE_&lt;name&gt;</code> containing <code>ROW_&lt;name&gt;</code>.</p></div>

<div class="scn"><h4>The inventory report that disagreed with the auditor</h4><p>A team used a script that screen-scraped <code>show version</code> and <code>show inventory</code> to build the hardware inventory for a support contract renewal. The auditor's list had 12 more serial numbers than the script's. The engineer found that on one switch model the text line wrapped differently, so the script's regular expression missed those serials. She rewrote the script to use <code>show version | json</code> and <code>show inventory | json</code>, reading <code>proc_board_id</code> and the serial key in each inventory row. The new report matched the auditor exactly, and it kept working after the next NX-OS upgrade.</p><p><b>Lesson:</b> keys in structured output are a stable contract; text layout is not.</p></div>

<div class="iv"><p class="q">"How do you get machine-readable output from a Nexus switch, and what does it look like?"</p><p>Strong answer: append <code>| json</code>, <code>| json-pretty</code> or <code>| xml</code> to a show command, or call NX-API with <code>cli_show</code> remotely. Explain that tables become <code>TABLE_x</code> and <code>ROW_x</code> keys, that you discover key names with json-pretty, and mention the single-row-is-an-object trap. Bonus: say you would use this to build compliance checks, such as comparing VLAN lists across vPC peers.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>| json</code> (compact), <code>| json-pretty</code> (readable) and <code>| xml</code> give structured output for most show commands.</li>
<li><code>show version | json</code> exposes fields such as <code>proc_board_id</code>, <code>nxos_ver_str</code> and <code>host_name</code>.</li>
<li>Tables become <code>TABLE_name</code> and <code>ROW_name</code>; column headings become keys.</li>
<li>A single row is returned as an object, not a list; handle both cases in code.</li>
<li>Structured output survives upgrades and layout changes; screen-scraping does not.</li>
</ul></div>
`,hi:`
<p>Do restaurant bills socho. Ek muda hua kaagaz hai jiske kinare par prices ghaseeti hui hain. Dusri itemised receipt hai jahan har line ka naam, quantity aur price fixed boxes mein hai. Accountant dusri wali ko seconds mein spreadsheet mein daal sakta hai. NX-OS lagbhag har show command ke liye aapko dono tarah ka bill de sakta hai: aapki aankhon ke liye normal text, aur programs ke liye <b>structured</b> version. Yeh chapter sikhata hai ki structured version kaise maango aur kaise padho, jo Lab 1 ka pehla task hai.</p>

<h3>Teen pipes</h3>
<p>NX-OS par output format badalne ke liye show command ke end mein pipe lagate ho:</p>
<ul>
<li><code>| json</code> ek lambi line par compact JSON deta hai. Programs ke liye best.</li>
<li><code>| json-pretty</code> wahi JSON kai lines mein indent karke deta hai. Un insaano ke liye best jo key names dhoondhna chahte hain.</li>
<li><code>| xml</code> data ko XML mein deta hai, NETCONF-style reply mein lapet kar.</li>
</ul>
<p>Teeno mein content same hai; sirf formatting badalti hai. Structured output wahi code banata hai jo NX-API use karta hai, isliye jo key names aap yahan dhoondhte ho, bilkul wahi keys aapki scripts aur API calls ko milengi.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Show command se program tak">
<rect x="10" y="30" width="160" height="44" rx="8" fill="#e2e8f0"/><text x="90" y="57" text-anchor="middle" class="svg-ink" font-size="13">show vlan brief</text>
<rect x="240" y="10" width="160" height="36" rx="8" fill="#fed7aa"/><text x="320" y="33" text-anchor="middle" class="svg-ink" font-size="13">text: aankhon ke liye</text>
<rect x="240" y="60" width="160" height="36" rx="8" fill="#bae6fd"/><text x="320" y="83" text-anchor="middle" class="svg-ink" font-size="13">| json: code ke liye</text>
<rect x="240" y="110" width="160" height="36" rx="8" fill="#ddd6fe"/><text x="320" y="133" text-anchor="middle" class="svg-ink" font-size="13">| xml: code ke liye</text>
<rect x="470" y="60" width="160" height="36" rx="8" fill="#bbf7d0"/><text x="550" y="83" text-anchor="middle" class="svg-ink" font-size="13">Python dict</text>
<line x1="170" y1="52" x2="240" y2="28" stroke="#64748b" stroke-width="2"/><line x1="170" y1="52" x2="240" y2="78" stroke="#64748b" stroke-width="2"/><line x1="170" y1="52" x2="240" y2="128" stroke="#64748b" stroke-width="2"/>
<line x1="400" y1="78" x2="470" y2="78" stroke="#64748b" stroke-width="2"/>
<text x="435" y="68" text-anchor="middle" class="svg-muted" font-size="12">json.loads</text>
</svg><p class="cap">Ek command, teen views. Programs ko hamesha structured view padhna chahiye.</p></div>

<h3>show version ko JSON mein padhna</h3>
<p>Jaane-pehchaane text ko uske JSON form se compare karo. Chassis serial number, jo text mein ek sentence mein chhupa hota hai ("Processor Board ID ..."), ek saaf key ban jaata hai jiska naam <code>proc_board_id</code> hai.</p>
<pre class="code">LEAF1# show version | json-pretty</pre>
<pre class="out">{
    "bios_ver_str": "05.47",
    "nxos_ver_str": "10.4(3)",
    "host_name": "LEAF1",
    "chassis_id": "Nexus9000 C93180YC-FX Chassis",
    "cpu_name": "Intel(R) Xeon(R) CPU D-1528 @ 1.90GHz",
    "memory": 24632252,
    "mem_type": "kB",
    <span class="hl">"proc_board_id": "FDO23460ABC",</span>
    "kern_uptm_days": 12,
    "rr_reason": "Reset Requested by CLI command reload",
    ...
}</pre>
<p>Lab 1 mein pehle <code>show version</code> chalao aur "Processor Board ID" wali line dhoondho, phir <code>show version | json-pretty</code> chalao aur <code>proc_board_id</code> dhoondho. Dono same serial dikhate hain; aapke lab switch ki apni value hai, isliye apni screen se copy karo.</p>

<h3>Tables TABLE_ aur ROW_ keys ban jaati hain</h3>
<p>Bahut saare show commands table print karte hain. JSON mein NX-OS table ko ek aisi key mein lapet deta hai jo <code>TABLE_</code> se shuru hoti hai, aur table ki har line ek aisi key ki entry banti hai jo <code>ROW_</code> se shuru hoti hai. Column headings har row ke andar keys ban jaati hain.</p>
<pre class="code">LEAF1# show vlan brief | json-pretty</pre>
<pre class="out">{
    "TABLE_vlanbriefxbrief": {
        "ROW_vlanbriefxbrief": [
            { "vlanshowbr-vlanid": 1,  "vlanshowbr-vlanname": "default", "vlanshowbr-vlanstate": "active" },
            { "vlanshowbr-vlanid": 10, "vlanshowbr-vlanname": "WEB",     "vlanshowbr-vlanstate": "active" },
            { "vlanshowbr-vlanid": 20, "vlanshowbr-vlanname": "DB",      "vlanshowbr-vlanstate": "active" },
            <span class="hl">{ "vlanshowbr-vlanid": 30, "vlanshowbr-vlanname": "APP",     "vlanshowbr-vlanstate": "active" }</span>
        ]
    }
}</pre>
<p>(Real output mein har row mein kuch aur keys hoti hain, jaise port list; yahan unhe kaat diya gaya hai.) Yahi pattern har jagah dikhta hai: <code>show interface brief | json</code> <code>TABLE_interface</code> aur <code>ROW_interface</code> deta hai jismein <code>interface</code>, <code>state</code>, <code>vlan</code> aur <code>speed</code> jaisi keys hoti hain; <code>show ip ospf neighbors | json</code> ke apne TABLE aur ROW names hain. Aap inhe ratte nahi ho; <code>| json-pretty</code> se dhoondhte ho.</p>

<h3>Wahi data XML mein</h3>
<pre class="code">LEAF1# show version | xml</pre>
<pre class="out">&lt;?xml version="1.0" encoding="ISO-8859-1"?&gt;
&lt;nf:rpc-reply xmlns:nf="urn:ietf:params:xml:ns:netconf:base:1.0" ...&gt;
 &lt;nf:data&gt;
  &lt;show&gt; &lt;version&gt; ...
     <span class="hl">&lt;proc_board_id&gt;FDO23460ABC&lt;/proc_board_id&gt;</span>
  ...
&lt;/nf:rpc-reply&gt;</pre>
<p>XML output zyada lamba hai aur extra layers mein lipta hota hai, isiliye zyada tar modern scripts JSON pasand karti hain.</p>

<h3>Python se parse karna</h3>
<p>Output JSON ho jaaye to Python ki kuch lines use report mein badal deti hain. Neeche wali script saved <code>show vlan brief | json</code> result padhti hai aur har VLAN print karti hai.</p>
<pre class="code">import json

with open('leaf1_vlans.json') as f:
    data = json.load(f)

rows = data['TABLE_vlanbriefxbrief']['ROW_vlanbriefxbrief']
if isinstance(rows, dict):          <span class="c"># sirf ek VLAN? NX-OS ek object deta hai, list nahi</span>
    rows = [rows]

for row in rows:
    print(row['vlanshowbr-vlanid'], row['vlanshowbr-vlanname'])</pre>
<pre class="out">1 default
10 WEB
20 DB
<span class="hl">30 APP</span></pre>

<div class="eg"><p><b>Worked example: single-row trap.</b> VLANs 1, 10, 20 aur 30 wala leaf <code>ROW_vlanbriefxbrief</code> ko 4 objects ki <b>list</b> ki tarah deta hai. Bilkul naya switch jismein sirf VLAN 1 hai, <code>ROW_vlanbriefxbrief</code> ko <b>ek object</b> ki tarah deta hai, 1 item ki list nahi. Lists ke liye likha loop tab us object ki keys par ghoomega aur bakwaas print karega ya crash hoga. Upar wala do line ka <code>isinstance</code> check script ko 1 row aur 4,000 rows dono ke liye chalata hai.</p></div>

<div class="warn"><p><b>Common galtiyan.</b> Key names <code>| json-pretty</code> se check karne ki jagah guess karna. Upar bataya single-row case bhool jaana. Yeh maan lena ki har command JSON support karta hai: kuch purane ya platform-specific commands nahi karte, aur data ki jagah error dete hain. Numbers ko strings samajhna ya ulta; values ko sahi type ke saath compare karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>| json</code> aur <code>| xml</code> structured output lene ka on-box tareeka hain; NX-API <code>cli_show</code> wahi JSON lene ka remote tareeka hai. Tables <code>TABLE_&lt;name&gt;</code> ke andar <code>ROW_&lt;name&gt;</code> ki tarah dikhti hain.</p></div>

<div class="scn"><h4>Inventory report jo auditor se match nahi hui</h4><p>Ek team support contract renewal ke liye hardware inventory banane ke liye aisi script use karti thi jo <code>show version</code> aur <code>show inventory</code> ko screen-scrape karti thi. Auditor ki list mein script se 12 serial numbers zyada the. Engineer ne dekha ki ek switch model par text line alag tarah wrap hoti thi, isliye script ka regular expression woh serials miss kar raha tha. Usne script ko <code>show version | json</code> aur <code>show inventory | json</code> use karne ke liye dobara likha, <code>proc_board_id</code> aur har inventory row ki serial key padhte hue. Nayi report auditor se bilkul match hui, aur agle NX-OS upgrade ke baad bhi chalti rahi.</p><p><b>Seekh:</b> structured output ki keys ek stable contract hain; text layout nahi.</p></div>

<div class="iv"><p class="q">"Nexus switch se machine-readable output kaise lete ho, aur woh kaisa dikhta hai?"</p><p>Strong answer: show command ke aage <code>| json</code>, <code>| json-pretty</code> ya <code>| xml</code> lagao, ya remotely NX-API ko <code>cli_show</code> ke saath call karo. Samjhao ki tables <code>TABLE_x</code> aur <code>ROW_x</code> keys ban jaati hain, ki key names json-pretty se dhoondhte ho, aur single-row-is-an-object trap batao. Bonus: bolo ki aap ise compliance checks banane mein use karoge, jaise vPC peers ke beech VLAN lists compare karna.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>| json</code> (compact), <code>| json-pretty</code> (readable) aur <code>| xml</code> zyada tar show commands ka structured output dete hain.</li>
<li><code>show version | json</code> <code>proc_board_id</code>, <code>nxos_ver_str</code> aur <code>host_name</code> jaise fields dikhata hai.</li>
<li>Tables <code>TABLE_name</code> aur <code>ROW_name</code> ban jaati hain; column headings keys ban jaati hain.</li>
<li>Single row list nahi, object ki tarah aati hai; code mein dono cases handle karo.</li>
<li>Structured output upgrades aur layout changes jhel leta hai; screen-scraping nahi.</li>
</ul></div>
`}};export{e as default};