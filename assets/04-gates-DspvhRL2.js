var e={id:`gates`,h:{en:`Pre-change gates: schema, Batfish and the address plan`,hi:`Change se pehle ke gates: schema, Batfish aur address plan`},body:{en:`
<p>A <b>gate</b> is a set of checks that must all pass before any device is touched. It is cheap (it runs on files, in a second), it is deterministic (the same files give the same answer) and it can say no. The gate does not prove that a change is good; it removes the changes that are obviously bad, so that people and routers only see the remaining ones.</p>

<h3>The analogy: the airport security line</h3>
<p>Security does not check whether your trip is a good idea. It checks, in a fixed order, a few things that must be true before you may walk to the aircraft: ticket, identity, bag. The cheap checks come first, the expensive ones later, and the first failure stops the line with a clear reason. A gate in a network toolkit is the same: ordered, cheap first, stops at the first problem, explains itself.</p>

<h3>Three stages in order</h3>
<pre class="code">STAGES = [("intent shape", stage_intent), ("template hygiene", stage_hygiene), ("address plan", stage_addresses)]

def run(folder="reports"):
    ctx = {"intents": intent.load_all()}
    report = {"stages": []}
    for number, (name, stage) in enumerate(STAGES, 1):
        reasons = stage(ctx)
        print("[%d/%d] %-17s %s" % (number, len(STAGES), name, "ok" if not reasons else "BLOCKED"))
        for why in reasons:
            print("      - " + why)
        report["stages"].append({"stage": name, "ok": not reasons, "reasons": reasons})
<span class="hl">        if reasons:
            break</span>
    report["result"] = "PASSED" if all(s["ok"] for s in report["stages"]) else "BLOCKED"
    ...
    return 0 if report["result"] == "PASSED" else 1</pre>
<p>The list of stages is data. Adding a fourth check means writing one function and adding one line; the loop, the report and the exit code stay as they are. The gate writes <code>reports/gate.json</code> as well, so a pipeline or a colleague can read the verdict without parsing text.</p>

<p><b>Stage 1, the shape of the intent.</b> Each intent document is checked against <code>schema/intent.schema.json</code>: required keys, a device-name pattern, <code>additionalProperties: false</code> so that a stray key is an error, and <code>format: ipv4</code> for every address. The detail that matters is one line of code.</p>
<pre class="code">validator = Draft202012Validator(schema, <span class="hl">format_checker=FormatChecker()</span>)</pre>
<p>In JSON Schema, <code>format</code> is an <i>annotation</i> unless a format checker is supplied. Without <code>FormatChecker()</code> the string <code>10.99.0.600</code> is a perfectly valid <code>ipv4</code>, and nothing complains. A toolkit that skips it looks fine and checks nothing.</p>

<p><b>Stage 2, template hygiene with Batfish.</b> Batfish reads the rendered files as if they were router configurations and reports what it cannot parse and what is used but never defined.</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("mvtoolkit")
bf.init_snapshot("build", name="candidate", overwrite=True)
for row in bf.q.parseWarning().answer(snapshot="candidate").frame().to_dict("records"):
    problems.append("%s line %s: %s (%s)" % (row["Filename"], row["Line"], row["Text"], row["Comment"]))
for row in bf.q.undefinedReferences().answer(snapshot="candidate").frame().to_dict("records"):
    problems.append("%s: undefined %s %s" % (row["File_Name"], row["Struct_Type"], row["Ref_Name"]))</pre>
<pre class="out">AUTO01$ sed -i 's/ ip address 1.1.1.1/ ip adress 1.1.1.1/' build/configs/NGP-BR-R1.cfg
AUTO01$ python3 mvtool.py gate; echo "exit code: $?"
[1/3] intent shape      ok
Successfully initialized snapshot 'candidate' from 'build'
Default snapshot is now set to candidate
[2/3] template hygiene  BLOCKED
      - configs/NGP-BR-R1.cfg line 7: ip adress 1.1.1.1 255.255.255.255 (This syntax is unrecognized)
GATE BLOCKED
exit code: 1</pre>
<p>The reason names the file, the line and the text. Note that <code>init_snapshot("build")</code> expects the configurations in a <code>configs</code> folder inside it, which is why the renderer writes to <code>build/configs/</code>.</p>

<p><b>Stage 3, the address plan.</b> A few lines of plain Python count every address across all intents (management and interface) and block any address used twice. Batfish cannot see this: two files, each valid alone, can still claim one address.</p>

<div class="warn"><p><b>What a gate does not do.</b> It does not know whether the device will accept a line (the dry run and the commit find out) and it does not know whether the result is what the intent wants (verify finds out). In the lab, Batfish is a simplified model: it flags a typo inside a known IOS stanza, but it did not flag a typo in a top-level line or in a Junos set line. Test your own Batfish with a deliberately broken file before you trust it; a gate you never saw say no is decoration.</p></div>

<div class="scn"><h4>The green gate that checked nothing</h4><p>A toolkit's gate had passed for a year. During a review someone changed a syslog address to 10.99.0.600 in a test and the gate still passed. The schema said "format: ipv4" and the validator was created without a format checker. The fix was two lines, and a new test that feeds the gate a deliberately wrong address and expects exit code 1.</p><p><b>Lesson:</b> every gate needs a test that makes it fail. The first thing to prove about a check is that it can say no.</p></div>

<div class="iv"><p class="q">"What belongs in a pre-change gate, and what does not?"</p><p>Anything that is cheap, deterministic and runs on files: schema validity, parse and reference checks, uniqueness of addresses, naming rules. It does not belong there to ask the network anything, because the gate must be runnable on a laptop in a pipeline. And I always keep a test that proves each check can fail.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A gate is ordered, cheap-first, stops at the first failing stage and explains itself.</li>
<li>JSON Schema <code>format</code> does nothing without a <code>FormatChecker</code>.</li>
<li>Batfish checks the rendered text for syntax and undefined references; know its limits.</li>
<li>An address-plan check covers what each single file cannot.</li>
<li>Prove that every check can fail with a deliberately broken input.</li>
</ul></div>
`,hi:`
<p><b>Gate</b> un checks ka set hai jo sab pass hone chahiye, device ko chhune se pehle. Woh sasta hai (files par, ek second mein chalta hai), deterministic hai (same files, same jawab) aur na bol sakta hai. Gate yeh saabit nahi karta ki change achha hai; woh saaf taur par bure changes ko hata deta hai, taaki log aur routers sirf bache hue changes dekhein.</p>

<h3>Analogy: airport security line</h3>
<p>Security yeh nahi dekhti ki aapka safar achha idea hai ya nahi. Woh ek tay kram mein kuch cheezein dekhti hai jo jahaaz tak jaane se pehle sach honi chahiye: ticket, pehchaan, bag. Sasti checks pehle, mehngi baad mein, aur pehli failure line rok deti hai saaf wajah ke saath. Network toolkit ka gate bhi aisa hi hai: kram se, sasta pehle, pehli problem par ruk jata hai, apni wajah batata hai.</p>

<h3>Teen stages kram se</h3>
<pre class="code">STAGES = [("intent shape", stage_intent), ("template hygiene", stage_hygiene), ("address plan", stage_addresses)]

def run(folder="reports"):
    ctx = {"intents": intent.load_all()}
    report = {"stages": []}
    for number, (name, stage) in enumerate(STAGES, 1):
        reasons = stage(ctx)
        print("[%d/%d] %-17s %s" % (number, len(STAGES), name, "ok" if not reasons else "BLOCKED"))
        for why in reasons:
            print("      - " + why)
        report["stages"].append({"stage": name, "ok": not reasons, "reasons": reasons})
<span class="hl">        if reasons:
            break</span>
    report["result"] = "PASSED" if all(s["ok"] for s in report["stages"]) else "BLOCKED"
    ...
    return 0 if report["result"] == "PASSED" else 1</pre>
<p>Stages ki list data hai. Chautha check jodna matlab ek function likhna aur ek line jodna; loop, report aur exit code jaise hain waise rehte hain. Gate <code>reports/gate.json</code> bhi likhta hai, taaki pipeline ya colleague text parse kiye bina verdict padh sake.</p>

<p><b>Stage 1, intent ka shape.</b> Har intent document <code>schema/intent.schema.json</code> se check hota hai: required keys, device-name pattern, <code>additionalProperties: false</code> taaki faltu key error ho, aur har address ke liye <code>format: ipv4</code>. Jo detail matter karti hai woh code ki ek line hai.</p>
<pre class="code">validator = Draft202012Validator(schema, <span class="hl">format_checker=FormatChecker()</span>)</pre>
<p>JSON Schema mein <code>format</code> ek <i>annotation</i> hai jab tak format checker na diya jaye. <code>FormatChecker()</code> ke bina string <code>10.99.0.600</code> bilkul valid <code>ipv4</code> hai, aur kuch shikayat nahi karta. Jo toolkit ise chhod deti hai woh theek dikhti hai aur kuch check nahi karti.</p>

<p><b>Stage 2, Batfish se template hygiene.</b> Batfish rendered files ko router configurations ki tarah padhta hai aur batata hai kya parse nahi hua aur kya use hua par kabhi define nahi hua.</p>
<pre class="code">bf = Session(host="localhost")
bf.set_network("mvtoolkit")
bf.init_snapshot("build", name="candidate", overwrite=True)
for row in bf.q.parseWarning().answer(snapshot="candidate").frame().to_dict("records"):
    problems.append("%s line %s: %s (%s)" % (row["Filename"], row["Line"], row["Text"], row["Comment"]))
for row in bf.q.undefinedReferences().answer(snapshot="candidate").frame().to_dict("records"):
    problems.append("%s: undefined %s %s" % (row["File_Name"], row["Struct_Type"], row["Ref_Name"]))</pre>
<pre class="out">AUTO01$ sed -i 's/ ip address 1.1.1.1/ ip adress 1.1.1.1/' build/configs/NGP-BR-R1.cfg
AUTO01$ python3 mvtool.py gate; echo "exit code: $?"
[1/3] intent shape      ok
Successfully initialized snapshot 'candidate' from 'build'
Default snapshot is now set to candidate
[2/3] template hygiene  BLOCKED
      - configs/NGP-BR-R1.cfg line 7: ip adress 1.1.1.1 255.255.255.255 (This syntax is unrecognized)
GATE BLOCKED
exit code: 1</pre>
<p>Wajah file, line aur text ka naam leti hai. Dhyan do ki <code>init_snapshot("build")</code> configurations ko apne andar <code>configs</code> folder mein dhoondhta hai, isliye renderer <code>build/configs/</code> mein likhta hai.</p>

<p><b>Stage 3, address plan.</b> Plain Python ki kuch lines saare intents ke har address ko ginti hain (management aur interface) aur jo address do baar aaye use block karti hain. Batfish yeh nahi dekh sakta: do files, har ek akeli valid, phir bhi ek address par dawa kar sakti hain.</p>

<div class="warn"><p><b>Gate kya nahi karta.</b> Woh nahi jaanta ki device line accept karega ya nahi (dry run aur commit pata lagate hain) aur woh nahi jaanta ki result wahi hai jo intent chahta hai (verify pata lagata hai). Lab mein Batfish ek simplified model hai: woh jaane hue IOS stanza ke andar ka typo pakadta hai, par top-level line ya Junos set line ka typo nahi pakda. Apne Batfish par bharosa karne se pehle jaan boojhkar toota hua file do; jis gate ko aapne kabhi na bolte nahi dekha woh sajawat hai.</p></div>

<div class="scn"><h4>Hara gate jisne kuch check nahi kiya</h4><p>Ek toolkit ka gate saal bhar pass hota raha. Review mein kisi ne test mein syslog address 10.99.0.600 kiya aur gate phir bhi pass hua. Schema mein "format: ipv4" tha aur validator format checker ke bina bana tha. Fix do lines ka tha, aur ek naya test jo gate ko jaan boojhkar galat address deta hai aur exit code 1 maanta hai.</p><p><b>Lesson:</b> har gate ko ek test chahiye jo use fail karaye. Kisi check ke baare mein pehli cheez saabit karni hai ki woh na bol sakta hai.</p></div>

<div class="iv"><p class="q">"Pre-change gate mein kya aana chahiye aur kya nahi?"</p><p>Jo sasta, deterministic aur files par chalne wala ho: schema validity, parse aur reference checks, addresses ki uniqueness, naming rules. Network se kuch poochna wahan nahi aata, kyunki gate pipeline mein laptop par chal sakna chahiye. Aur main hamesha ek test rakhta hoon jo saabit kare ki har check fail ho sakta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Gate kram se chalta hai, sasta pehle, pehle fail hone wale stage par ruk jata hai aur apni wajah batata hai.</li>
<li>JSON Schema <code>format</code> bina <code>FormatChecker</code> ke kuch nahi karta.</li>
<li>Batfish rendered text ka syntax aur undefined references dekhta hai; uski limits jaano.</li>
<li>Address-plan check woh dekhta hai jo akeli file nahi dekh sakti.</li>
<li>Jaan boojhkar galat input se saabit karo ki har check fail ho sakta hai.</li>
</ul></div>
`}};export{e as default};