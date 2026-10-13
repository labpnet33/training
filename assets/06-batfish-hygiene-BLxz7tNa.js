var e={id:`batfish-hygiene`,h:{en:`Hygiene questions: parse warnings, undefined and unused references`,hi:`Hygiene questions: parse warnings, undefined aur unused references`},body:{en:`
<p>A legal contract says "as described in clause 7". A careful reader checks that clause 7 exists. Network configs are full of such cross-references: a BGP neighbour names a route-map, a route-map names a prefix-list, an interface names an access list, a Junos group exports a policy. A device accepts a reference to something that is not there and then behaves as if the filter did not exist. Batfish checks every cross-reference in every file. These are the <b>hygiene questions</b>, and they find more real faults than any other check in this module.</p>

<h3>Five tables, one idea each</h3>
<table class="cmp"><tr><th>Question</th><th>It tells you</th><th>Gate decision</th></tr>
<tr><td><code>fileParseStatus</code></td><td>per file: PASSED, PARTIALLY_UNRECOGNIZED or FAILED, and the vendor</td><td>block on FAILED</td></tr>
<tr><td><code>parseWarning</code></td><td>lines the parser did not understand (usually a typo in a command)</td><td>block</td></tr>
<tr><td><code>undefinedReferences</code></td><td>names used but never defined</td><td>block</td></tr>
<tr><td><code>unusedStructures</code></td><td>things defined but never used</td><td>warn</td></tr>
<tr><td><code>initIssues</code></td><td>a summary of the problems found while building the model</td><td>read it</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="A definition and a reference that do not match"><rect x="20" y="28" width="250" height="56" rx="9" fill="#bbf7d0"/><text x="145" y="52" text-anchor="middle" class="svg-ink" font-size="13">defined structure</text><text x="145" y="68" text-anchor="middle" class="svg-ink" font-size="13">route-map RM-OUT permit 10</text><rect x="370" y="28" width="250" height="56" rx="9" fill="#fde68a"/><text x="495" y="52" text-anchor="middle" class="svg-ink" font-size="13">reference</text><text x="495" y="68" text-anchor="middle" class="svg-ink" font-size="13">neighbor ... route-map rm-out out</text><line x1="270" y1="56" x2="370" y2="56" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 5"/><text x="320" y="48" text-anchor="middle" class="svg-accent" font-size="18">X</text><rect x="20" y="112" width="250" height="56" rx="9" fill="#fed7aa"/><text x="145" y="136" text-anchor="middle" class="svg-ink" font-size="13">unusedStructures</text><text x="145" y="152" text-anchor="middle" class="svg-ink" font-size="13">RM-OUT is never referenced</text><rect x="370" y="112" width="250" height="56" rx="9" fill="#fed7aa"/><text x="495" y="136" text-anchor="middle" class="svg-ink" font-size="13">undefinedReferences</text><text x="495" y="152" text-anchor="middle" class="svg-ink" font-size="13">rm-out is never defined</text><line x1="145" y1="84" x2="145" y2="112" stroke="#94a3b8" stroke-width="2"/><line x1="495" y1="84" x2="495" y2="112" stroke="#94a3b8" stroke-width="2"/></svg><p class="cap">One typo makes two findings. IOS names are case sensitive, so rm-out is not RM-OUT.</p></div>

<h3>Run them on a snapshot with typos</h3>
<p>The snapshot <code>hyg</code> holds the same three routers, now with one typo per vendor plus a mistyped command on xe1. This is the same set of faults you will meet in Lab 2.</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("nk-lab")
bf.init_snapshot("hyg", name="hyg", overwrite=True)
print(bf.q.fileParseStatus().answer().frame())
print(bf.q.parseWarning().answer().frame())
print(bf.q.undefinedReferences().answer().frame())
print(bf.q.unusedStructures().answer().frame())
print(bf.q.initIssues().answer().frame())</pre>
<pre class="out">AUTO01$ python3 bf_hygiene.py
Successfully initialized snapshot 'hyg' from 'hyg'
Default snapshot is now set to hyg
         File_Name                  Status  File_Format    Nodes
0   configs/e1.cfg                  PASSED       ARISTA   ['e1']
1   configs/j1.cfg                  PASSED      JUNIPER   ['j1']
<span class="hl">2  configs/xe1.cfg  PARTIALLY_UNRECOGNIZED    CISCO_IOS  ['xe1']</span>
          Filename  Line                                 Text  Parser_Context                      Comment
<span class="hl">0  configs/xe1.cfg    27  neighbour 10.0.13.3 remote-as 65003    [router bgp]  This syntax is unrecognized</span>
         File_Name       Struct_Type   Ref_Name                           Context                 Lines
<span class="hl">0   configs/e1.cfg  ipv4 prefix-list    PL-XE-1  route-map match ipv4 prefix-list   configs/e1.cfg:[16]</span>
<span class="hl">1   configs/j1.cfg  policy-statement  EXPORT-L0       bgp export policy-statement   configs/j1.cfg:[11]</span>
<span class="hl">2  configs/xe1.cfg         route-map     rm-out            bgp outbound route-map  configs/xe1.cfg:[24]</span>
     Structure_Type  Structure_Name              Source_Lines
0  ipv4 prefix-list          PL-XE1       configs/e1.cfg:[13]
1  policy-statement       EXPORT-LO     configs/j1.cfg:[7, 8]
<span class="hl">2  policy-statement      OLD-IMPORT       configs/j1.cfg:[13]</span>
3         route-map          RM-OUT  configs/xe1.cfg:[18, 19]
<span class="hl">4  ipv4 access-list        OLD-MGMT  configs/xe1.cfg:[29, 30]</span>
     Nodes          Source_Lines           Type                      Details                            Line_Text  Parser_Context
<span class="hl">0  ['xe1']  configs/xe1.cfg:[27]  Parse warning  This syntax is unrecognized  neighbour 10.0.13.3 remote-as 65003    [router bgp]</span></pre>

<h3>Reading each table</h3>
<ul>
<li><b>fileParseStatus.</b> xe1.cfg is <code>PARTIALLY_UNRECOGNIZED</code>: the parser skipped something. The other two are clean.</li>
<li><b>parseWarning.</b> Line 27 of xe1.cfg: <code>neighbour 10.0.13.3 remote-as 65003</code>. The spelling "neighbour" is British; IOS wants <code>neighbor</code>. A real router would also refuse this line, but a script that pushes configs and ignores the reply would not notice. Batfish gives you the file, the line, the text and the context (<code>[router bgp]</code>).</li>
<li><b>undefinedReferences.</b> Three rows, one per vendor. Read the columns left to right: the file, the <b>kind</b> of structure (<code>route-map</code> on Cisco, <code>policy-statement</code> on Junos, <code>ipv4 prefix-list</code> on EOS), the missing name, the <b>context</b> that tells you why something was looking for it, and the line. The context is the most useful column: "bgp outbound route-map" says a neighbour wanted a route-map for outbound routes.</li>
<li><b>unusedStructures.</b> Five rows, and now look at them next to the undefined names. The unused <code>RM-OUT</code> on xe1 is the route-map that <code>rm-out</code> should have pointed to. The unused <code>EXPORT-LO</code> on j1 is the policy that <code>EXPORT-L0</code> (zero, not letter O) missed. The unused <code>PL-XE1</code> on e1 belongs to <code>PL-XE-1</code>. <b>One typo produces a pair</b>: an undefined name and an unused one that look alike. The two other unused structures, <code>OLD-IMPORT</code> and <code>OLD-MGMT</code>, are leftovers nobody uses.</li>
<li><b>initIssues.</b> Repeats the parse warning in one table with the node and the line text.</li>
</ul>
<p>The helper that turns these tables into the lines of the gate is short. It returns a list, and an empty list means clean.</p>
<pre class="code">def hygiene(bf, snap):
    """Parse warnings and undefined references, as a list of text lines (empty list = clean)."""
    problems = []
    for row in bf.q.parseWarning().answer(snapshot=snap).frame().to_dict("records"):
        problems.append("parse warning %s line %s: %s" % (row["Filename"], row["Line"], row["Text"]))
    for row in bf.q.undefinedReferences().answer(snapshot=snap).frame().to_dict("records"):
        problems.append("undefined %s %s (%s) %s" % (row["Struct_Type"], row["Ref_Name"], row["Context"], row["Lines"]))
    return problems</pre>

<h3>Names are exact</h3>
<p>Batfish compares names the way the device does, character by character. On IOS route-map names are case sensitive, so <code>rm-out</code> is not <code>RM-OUT</code>. Digit zero and letter O look the same in many fonts. A dash in a different place is a different name. Most real undefined references are one of these three: <b>case, 0 against O, a stray dash or underscore</b>.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> The structure types and context strings in the lab are close to real Batfish's but are not guaranteed identical for every vendor construct. Unrecognised lines appear as <code>parseWarning</code> rows with the comment "This syntax is unrecognized", and a file whose vendor cannot be guessed gets <code>FAILED</code>. Treat the shape of the answer as real and the exact wording of rare contexts as approximate.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Treating unused structures as errors and blocking on every old ACL. Decide a policy: warn, and block only when the unused name is close to an undefined one. (2) Ignoring <code>parseWarning</code> because the device "accepts" the line. (3) Testing only the file you changed: a reference in another file can break when a definition is renamed.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Undefined reference" and "unused structure" are two halves of the same typo only when the names are alike. Do not assume every unused structure is a mistake.</p></div>

<div class="scn"><h4>The ACL that was never applied</h4><p>A security change created <code>MGMT-ONLY</code> and applied <code>MGMT_ONLY</code> to the VTY lines on thirty routers. The routers took the line, and management stayed open to everyone. The weekly Batfish report listed thirty undefined references and thirty unused structures. Nobody read it, because it was not a gate. After that team made undefined references block the pipeline, the same typo never reached a device again.</p><p><b>Lesson:</b> a report people can skip is a log. A check that stops the pipeline is a control.</p></div>

<div class="iv"><p class="q">"How do you find a typo in a policy name across three vendors?"</p><p>I load the configs into one Batfish snapshot and ask <code>undefinedReferences</code>. It shows the structure type, the missing name, the context and the file and line, whatever the vendor. Then I read <code>unusedStructures</code>: the defined name that is almost the same is the intended one.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Start with <code>fileParseStatus</code>, then <code>parseWarning</code>, <code>undefinedReferences</code>, <code>unusedStructures</code>.</li>
<li>Undefined references and parse warnings block; unused structures warn.</li>
<li>The Context column explains why a name was wanted.</li>
<li>One typo makes a pair: undefined name plus a similar unused name.</li>
<li>Names are exact: case, 0 and O, and dashes all matter.</li>
</ul></div>
`,hi:`
<p>Legal contract kehta hai "jaisa clause 7 mein bataya gaya hai". Dhyan se padhne wala dekhta hai ki clause 7 hai bhi. Network configs aise cross-references se bhare hain: BGP neighbour route-map ka naam leta hai, route-map prefix-list ka, interface access list ka, Junos group policy export karta hai. Device aise cheez ka reference accept kar leta hai jo hai hi nahi aur phir aise chalta hai jaise filter tha hi nahi. Batfish har file ka har cross-reference check karta hai. Yeh <b>hygiene questions</b> hain, aur yeh is module ke kisi bhi aur check se zyada asli galtiyan pakadte hain.</p>

<h3>Paanch tables, har ek ka ek idea</h3>
<table class="cmp"><tr><th>Question</th><th>Kya batata hai</th><th>Gate ka faisla</th></tr>
<tr><td><code>fileParseStatus</code></td><td>har file: PASSED, PARTIALLY_UNRECOGNIZED ya FAILED, aur vendor</td><td>FAILED par block</td></tr>
<tr><td><code>parseWarning</code></td><td>woh lines jo parser nahi samjha (aksar command mein typo)</td><td>block</td></tr>
<tr><td><code>undefinedReferences</code></td><td>naam jo use hue par kabhi define nahi hue</td><td>block</td></tr>
<tr><td><code>unusedStructures</code></td><td>jo define hua par kabhi use nahi hua</td><td>warn</td></tr>
<tr><td><code>initIssues</code></td><td>model banate waqt mili problems ka saar</td><td>padho</td></tr></table>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Definition aur reference jo match nahi karte"><rect x="20" y="28" width="250" height="56" rx="9" fill="#bbf7d0"/><text x="145" y="52" text-anchor="middle" class="svg-ink" font-size="13">defined structure</text><text x="145" y="68" text-anchor="middle" class="svg-ink" font-size="13">route-map RM-OUT permit 10</text><rect x="370" y="28" width="250" height="56" rx="9" fill="#fde68a"/><text x="495" y="52" text-anchor="middle" class="svg-ink" font-size="13">reference</text><text x="495" y="68" text-anchor="middle" class="svg-ink" font-size="13">neighbor ... route-map rm-out out</text><line x1="270" y1="56" x2="370" y2="56" stroke="#dc2626" stroke-width="3" stroke-dasharray="6 5"/><text x="320" y="48" text-anchor="middle" class="svg-accent" font-size="18">X</text><rect x="20" y="112" width="250" height="56" rx="9" fill="#fed7aa"/><text x="145" y="136" text-anchor="middle" class="svg-ink" font-size="13">unusedStructures</text><text x="145" y="152" text-anchor="middle" class="svg-ink" font-size="13">RM-OUT kabhi refer nahi hota</text><rect x="370" y="112" width="250" height="56" rx="9" fill="#fed7aa"/><text x="495" y="136" text-anchor="middle" class="svg-ink" font-size="13">undefinedReferences</text><text x="495" y="152" text-anchor="middle" class="svg-ink" font-size="13">rm-out kabhi define nahi hua</text><line x1="145" y1="84" x2="145" y2="112" stroke="#94a3b8" stroke-width="2"/><line x1="495" y1="84" x2="495" y2="112" stroke="#94a3b8" stroke-width="2"/></svg><p class="cap">Ek typo do findings banata hai. IOS ke naam case sensitive hain, isliye rm-out aur RM-OUT alag hain.</p></div>

<h3>Typos wale snapshot par chalao</h3>
<p>Snapshot <code>hyg</code> mein wahi teen routers hain, ab har vendor mein ek typo aur xe1 par ek galat likha command. Yeh wahi faults hain jo aapko Lab 2 mein milenge.</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("nk-lab")
bf.init_snapshot("hyg", name="hyg", overwrite=True)
print(bf.q.fileParseStatus().answer().frame())
print(bf.q.parseWarning().answer().frame())
print(bf.q.undefinedReferences().answer().frame())
print(bf.q.unusedStructures().answer().frame())
print(bf.q.initIssues().answer().frame())</pre>
<pre class="out">AUTO01$ python3 bf_hygiene.py
Successfully initialized snapshot 'hyg' from 'hyg'
Default snapshot is now set to hyg
         File_Name                  Status  File_Format    Nodes
0   configs/e1.cfg                  PASSED       ARISTA   ['e1']
1   configs/j1.cfg                  PASSED      JUNIPER   ['j1']
<span class="hl">2  configs/xe1.cfg  PARTIALLY_UNRECOGNIZED    CISCO_IOS  ['xe1']</span>
          Filename  Line                                 Text  Parser_Context                      Comment
<span class="hl">0  configs/xe1.cfg    27  neighbour 10.0.13.3 remote-as 65003    [router bgp]  This syntax is unrecognized</span>
         File_Name       Struct_Type   Ref_Name                           Context                 Lines
<span class="hl">0   configs/e1.cfg  ipv4 prefix-list    PL-XE-1  route-map match ipv4 prefix-list   configs/e1.cfg:[16]</span>
<span class="hl">1   configs/j1.cfg  policy-statement  EXPORT-L0       bgp export policy-statement   configs/j1.cfg:[11]</span>
<span class="hl">2  configs/xe1.cfg         route-map     rm-out            bgp outbound route-map  configs/xe1.cfg:[24]</span>
     Structure_Type  Structure_Name              Source_Lines
0  ipv4 prefix-list          PL-XE1       configs/e1.cfg:[13]
1  policy-statement       EXPORT-LO     configs/j1.cfg:[7, 8]
<span class="hl">2  policy-statement      OLD-IMPORT       configs/j1.cfg:[13]</span>
3         route-map          RM-OUT  configs/xe1.cfg:[18, 19]
<span class="hl">4  ipv4 access-list        OLD-MGMT  configs/xe1.cfg:[29, 30]</span>
     Nodes          Source_Lines           Type                      Details                            Line_Text  Parser_Context
<span class="hl">0  ['xe1']  configs/xe1.cfg:[27]  Parse warning  This syntax is unrecognized  neighbour 10.0.13.3 remote-as 65003    [router bgp]</span></pre>

<h3>Har table ko padhna</h3>
<ul>
<li><b>fileParseStatus.</b> xe1.cfg <code>PARTIALLY_UNRECOGNIZED</code> hai: parser ne kuch chhod diya. Baaki do saaf hain.</li>
<li><b>parseWarning.</b> xe1.cfg ki line 27: <code>neighbour 10.0.13.3 remote-as 65003</code>. "neighbour" ki spelling British hai; IOS ko <code>neighbor</code> chahiye. Asli router bhi yeh line mana kar deta, par jo script configs push karke jawab ignore karti hai use pata nahi chalta. Batfish file, line, text aur context (<code>[router bgp]</code>) deta hai.</li>
<li><b>undefinedReferences.</b> Teen rows, har vendor ka ek. Columns baayein se daayein padho: file, structure ki <b>kism</b> (Cisco par <code>route-map</code>, Junos par <code>policy-statement</code>, EOS par <code>ipv4 prefix-list</code>), gaya hua naam, woh <b>context</b> jo batata hai ki kaun use dhoondh raha tha, aur line. Context sabse kaam ka column hai: "bgp outbound route-map" kehta hai ki neighbour ko outbound routes ke liye route-map chahiye tha.</li>
<li><b>unusedStructures.</b> Paanch rows, aur ab unhe undefined naamon ke saath dekho. xe1 ka unused <code>RM-OUT</code> wahi route-map hai jise <code>rm-out</code> ko point karna tha. j1 ka unused <code>EXPORT-LO</code> woh policy hai jo <code>EXPORT-L0</code> (zero, letter O nahi) se chhoot gayi. e1 ka unused <code>PL-XE1</code> <code>PL-XE-1</code> ka hai. <b>Ek typo ek jodi banata hai</b>: ek undefined naam aur ek milta-julta unused naam. Baaki do unused structures, <code>OLD-IMPORT</code> aur <code>OLD-MGMT</code>, bache hue kachre hain jo koi use nahi karta.</li>
<li><b>initIssues.</b> Parse warning ko ek table mein node aur line text ke saath dohrata hai.</li>
</ul>
<p>In tables ko gate ki lines mein badalne wala helper chhota hai. Woh list lautata hai, aur khaali list ka matlab saaf.</p>
<pre class="code">def hygiene(bf, snap):
    """Parse warnings and undefined references, as a list of text lines (empty list = clean)."""
    problems = []
    for row in bf.q.parseWarning().answer(snapshot=snap).frame().to_dict("records"):
        problems.append("parse warning %s line %s: %s" % (row["Filename"], row["Line"], row["Text"]))
    for row in bf.q.undefinedReferences().answer(snapshot=snap).frame().to_dict("records"):
        problems.append("undefined %s %s (%s) %s" % (row["Struct_Type"], row["Ref_Name"], row["Context"], row["Lines"]))
    return problems</pre>

<h3>Naam exact hote hain</h3>
<p>Batfish naam waise hi compare karta hai jaise device karta hai, character by character. IOS par route-map ke naam case sensitive hain, isliye <code>rm-out</code> aur <code>RM-OUT</code> alag hain. Digit zero aur letter O kai fonts mein ek jaise dikhte hain. Alag jagah ka dash alag naam hai. Zyadatar asli undefined references inme se ek hote hain: <b>case, 0 aur O, ya galat dash ya underscore</b>.</p>

<div class="note"><p><b>Lab mein vs real gear par.</b> Lab ke structure types aur context strings real Batfish ke kareeb hain par har vendor construct ke liye identical hone ki guarantee nahi. Unrecognised lines <code>parseWarning</code> rows ban kar aati hain, comment "This syntax is unrecognized" ke saath, aur jis file ka vendor guess na ho use <code>FAILED</code> milta hai. Answer ki shape ko asli maano, aur rare contexts ki exact wording ko andaazan.</p></div>

<div class="warn"><p><b>Aam galtiyan.</b> (1) Unused structures ko error maan kar har purane ACL par block karna. Policy tay karo: warn, aur tabhi block karo jab unused naam kisi undefined naam ke kareeb ho. (2) <code>parseWarning</code> ignore karna kyunki device line "accept" karta hai. (3) Sirf badli hui file test karna: definition ka naam badalne par doosri file ka reference toot sakta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Undefined reference" aur "unused structure" ek hi typo ke do hisse tabhi hain jab naam milte-julte hon. Har unused structure ko galti mat maano.</p></div>

<div class="scn"><h4>Woh ACL jo lagi hi nahi</h4><p>Ek security change ne <code>MGMT-ONLY</code> banaya aur tees routers ki VTY lines par <code>MGMT_ONLY</code> lagaya. Routers ne line le li, aur management sabke liye khula raha. Haftawar Batfish report mein tees undefined references aur tees unused structures the. Kisi ne nahi padhi, kyunki woh gate nahi thi. Us team ne jab undefined references ko pipeline block karne wala bana diya, wahi typo phir kabhi device tak nahi pahunchi.</p><p><b>Lesson:</b> jo report log chhod sakte hain woh log hai. Jo check pipeline rok de woh control hai.</p></div>

<div class="iv"><p class="q">"Teen vendors mein policy ke naam ka typo kaise dhoondhte ho?"</p><p>Main configs ko ek Batfish snapshot mein load karta hoon aur <code>undefinedReferences</code> poochhta hoon. Vendor chahe jo ho, woh structure type, gaya hua naam, context aur file aur line dikhata hai. Phir <code>unusedStructures</code> padhta hoon: jo define hua naam lagbhag wahi hai, wahi intended tha.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>fileParseStatus</code> se shuru karo, phir <code>parseWarning</code>, <code>undefinedReferences</code>, <code>unusedStructures</code>.</li>
<li>Undefined references aur parse warnings block karte hain; unused structures warn karte hain.</li>
<li>Context column batata hai ki naam kyun chahiye tha.</li>
<li>Ek typo ek jodi banata hai: undefined naam aur milta-julta unused naam.</li>
<li>Naam exact hote hain: case, 0 aur O, aur dash sab matter karte hain.</li>
</ul></div>
`}};export{e as default};