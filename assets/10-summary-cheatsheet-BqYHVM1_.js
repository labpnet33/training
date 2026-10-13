var e={id:`summary-cheatsheet`,h:{en:`Summary: the pre-change workflow, cheat sheet and glossary`,hi:`Summary: pre-change workflow, cheat sheet aur glossary`},body:{en:`
<p>You can now stop a bad change before it leaves your laptop. This last chapter is the one to read the night before an interview or an exam: the workflow in one table, a can-do checklist, a glossary, the most tested facts and a cheat sheet of the calls you used.</p>

<h3>The workflow in one table</h3>
<table class="cmp"><tr><th>Stage</th><th>Question</th><th>Tool and call</th><th>Blocks when</th></tr>
<tr><td>1 intent shape</td><td>Is the request well formed?</td><td><code>Draft202012Validator(...).iter_errors</code></td><td>any error</td></tr>
<tr><td>2 hygiene</td><td>Are configs consistent?</td><td><code>parseWarning</code>, <code>undefinedReferences</code></td><td>any row</td></tr>
<tr><td>3 sessions</td><td>Does each promised session come up?</td><td><code>bgpSessionStatus</code></td><td>not ESTABLISHED</td></tr>
<tr><td>4 state diff</td><td>Is the difference the intended one?</td><td><code>DeepDiff(before, after)</code></td><td>removal, change or extra addition</td></tr>
<tr><td>5 reachability</td><td>Can the promised prefix be reached?</td><td><code>traceroute</code> with <code>HeaderConstraints</code></td><td>disposition not ACCEPTED</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>I can write a JSON Schema with type, required, additionalProperties, limits, enum, <code>$defs</code> and <code>$ref</code>.</li>
<li>I can report every error of a YAML file with <code>iter_errors</code>, paths included, and exit 1.</li>
<li>I know that <code>format</code> needs a <code>FormatChecker</code> and that a schema checks shape, not meaning.</li>
<li>I can build a snapshot folder, start a pybatfish <code>Session</code> and read <code>fileParseStatus</code>.</li>
<li>I can find undefined references and parse warnings in IOS XE, Junos and EOS and pair them with the unused name.</li>
<li>I can read BGP session status and compatibility, and a traceroute disposition.</li>
<li>I can turn Batfish tables into dictionaries and compare them with DeepDiff, expecting a defined difference.</li>
<li>I can write a gate with stages, a JSON report and an exit code, and read its BLOCKED messages.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Intent</dt><dd>data that says what you want the network to be, such as sessions and announced prefixes.</dd>
<dt>JSON Schema</dt><dd>a data description of what a valid document looks like.</dd>
<dt>Draft202012Validator</dt><dd>the jsonschema class for the 2020-12 draft of the standard.</dd>
<dt>Snapshot</dt><dd>a set of configs at a moment, uploaded to Batfish from a folder with <code>configs/</code>.</dd>
<dt>Undefined reference</dt><dd>a name that is used but never defined, found by Batfish.</dd>
<dt>Disposition</dt><dd>how a traced packet ends: ACCEPTED, NO_ROUTE and others.</dd>
<dt>HALF_OPEN</dt><dd>a BGP session configured on one side whose peer does not match it.</dd>
<dt>Gate</dt><dd>a script whose exit code decides whether a change may proceed.</dd>
</dl>

<h3>Most tested facts</h3>
<ul>
<li><code>validate()</code> returns None when valid and raises <code>ValidationError</code> when not; a bad schema raises <code>SchemaError</code>.</li>
<li>JSON Schema is strict about types: "65003" is not 65003. Closing the object needs <code>additionalProperties: false</code>.</li>
<li>Batfish needs a folder with <code>configs/</code>; node names are lower case; the API port is 9996.</li>
<li>One typo makes an undefined reference and an unused structure with a similar name.</li>
<li>A BGP session appears once per side in Batfish tables.</li>
<li>deepdiff paths look like <code>root['j1']['1.1.1.1/32']</code>; <code>dictionary_item_removed</code> holds paths, not values.</li>
<li>A passing offline check is a prediction from configuration, not a measurement of the live network.</li>
</ul>

<h3>Cheat sheet</h3>
<pre class="code">from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import best_match
v = Draft202012Validator(schema, format_checker=FormatChecker())
errors = sorted(v.iter_errors(data), key=lambda e: list(e.absolute_path))
err.message  err.absolute_path  err.json_path  err.validator

from pybatfish.client.session import Session
bf = Session(host="localhost"); bf.set_network("nk-lab")
bf.init_snapshot("candidate", name="candidate", overwrite=True)
bf.q.undefinedReferences().answer(snapshot="candidate").frame()
bf.q.parseWarning()  bf.q.unusedStructures()  bf.q.fileParseStatus()
bf.q.bgpSessionStatus()  bf.q.bgpSessionCompatibility()
bf.q.routes(nodes="e1", protocols="bgp", network="192.0.2.0/24")
bf.q.traceroute(startLocation="e1", headers=HeaderConstraints(dstIps="192.0.2.1"))
frame.to_dict("records")

from deepdiff import DeepDiff
d = DeepDiff(old, new, ignore_order=True, ignore_string_case=True,
             exclude_paths=[...], include_paths=[...], significant_digits=1, verbose_level=2)
d.pretty()  d.affected_root_keys  bool(d)  d.get("dictionary_item_removed", [])</pre>

<h3>Lab versus real gear, in one place</h3>
<table class="cmp"><tr><th>Topic</th><th>Lab</th><th>Real gear</th></tr>
<tr><td>Batfish service</td><td>built in, always on</td><td>container on ports 9996 and 9997</td></tr>
<tr><td>Messages</td><td>printed to the screen</td><td>logged</td></tr>
<tr><td>Vendors parsed</td><td>IOS, IOS XE, EOS, Junos</td><td>many more</td></tr>
<tr><td>Data plane</td><td>best effort (BGP, OSPF, static)</td><td>full model</td></tr>
<tr><td>deepdiff</td><td>text view and common options</td><td>also tree view, Delta, DeepHash</td></tr>
<tr><td>jsonschema</td><td>4.23 look-alike, local references</td><td>remote references, more formats</td></tr></table>

<div class="scn"><h4>The interview whiteboard</h4><p>An interviewer asks you to prevent a typo in a route-map name from reaching production, across Cisco and Juniper. You draw the five stages, say which tool is behind each, and finish with the exit code and the confirmed commit after the gate. You mention what the gate cannot see. They write "knows the limits" on the sheet.</p><p><b>Lesson:</b> naming the limits of your checks sounds senior, not weak.</p></div>

<div class="iv"><p class="q">"Where does offline validation end and live verification begin?"</p><p>Offline checks predict from configs and intent and run before the change. Live verification measures the real device after the change, with snapshots and checks as in adv-junos-validate. I want both: the gate to stop obvious faults, and a confirmed commit plus post-check to catch what the model cannot know.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Three questions, three tools: shape with jsonschema, consistency and behaviour with Batfish, difference with deepdiff.</li>
<li>A gate is stages, reasons, a report and an exit code.</li>
<li>Names are exact; one typo makes an undefined and an unused pair.</li>
<li>Offline checks predict; live checks measure. Use both.</li>
<li>Next in the track: adv-vault feeds secrets to such scripts at run time, and later modules put the gate in a pipeline.</li>
</ul></div>
`,hi:`
<p>Ab aap kharab change ko laptop se nikalne se pehle rok sakte ho. Yeh aakhri chapter interview ya exam se pehli raat padhne ke liye hai: workflow ek table mein, can-do checklist, glossary, sabse zyada poochhe jaane wale facts aur aapke use kiye hue calls ki cheat sheet.</p>

<h3>Workflow ek table mein</h3>
<table class="cmp"><tr><th>Stage</th><th>Sawaal</th><th>Tool aur call</th><th>Kab block karta hai</th></tr>
<tr><td>1 intent shape</td><td>Request theek bani hai?</td><td><code>Draft202012Validator(...).iter_errors</code></td><td>koi bhi error</td></tr>
<tr><td>2 hygiene</td><td>Configs consistent hain?</td><td><code>parseWarning</code>, <code>undefinedReferences</code></td><td>koi bhi row</td></tr>
<tr><td>3 sessions</td><td>Vaade kiya har session up hoga?</td><td><code>bgpSessionStatus</code></td><td>ESTABLISHED nahi</td></tr>
<tr><td>4 state diff</td><td>Farak wahi hai jo irada tha?</td><td><code>DeepDiff(before, after)</code></td><td>removal, change ya extra addition</td></tr>
<tr><td>5 reachability</td><td>Vaade kiya prefix pahunch mein hai?</td><td><code>traceroute</code> aur <code>HeaderConstraints</code></td><td>disposition ACCEPTED nahi</td></tr></table>

<h3>Can-do checklist</h3>
<ul>
<li>Main type, required, additionalProperties, limits, enum, <code>$defs</code> aur <code>$ref</code> ke saath JSON Schema likh sakta hoon.</li>
<li>Main <code>iter_errors</code> se YAML file ke har error ko path ke saath report karke exit 1 kar sakta hoon.</li>
<li>Mujhe pata hai ki <code>format</code> ko <code>FormatChecker</code> chahiye aur schema shape check karta hai, matlab nahi.</li>
<li>Main snapshot folder bana sakta hoon, pybatfish <code>Session</code> shuru kar sakta hoon aur <code>fileParseStatus</code> padh sakta hoon.</li>
<li>Main IOS XE, Junos aur EOS mein undefined references aur parse warnings dhoondh kar unused naam se jod sakta hoon.</li>
<li>Main BGP session status aur compatibility, aur traceroute disposition padh sakta hoon.</li>
<li>Main Batfish tables ko dictionaries banakar DeepDiff se compare kar sakta hoon, tay farak ki ummeed ke saath.</li>
<li>Main stages, JSON report aur exit code wala gate likh sakta hoon aur uske BLOCKED messages padh sakta hoon.</li>
</ul>

<h3>Glossary</h3>
<dl class="terms">
<dt>Intent</dt><dd>data jo batata hai ki aap network kaisa chahte ho, jaise sessions aur announce hone wale prefixes.</dd>
<dt>JSON Schema</dt><dd>valid document kaisa dikhta hai, uska data-roop description.</dd>
<dt>Draft202012Validator</dt><dd>standard ke 2020-12 draft ke liye jsonschema class.</dd>
<dt>Snapshot</dt><dd>ek pal ke configs ka set, <code>configs/</code> wale folder se Batfish mein upload.</dd>
<dt>Undefined reference</dt><dd>aisa naam jo use hua par define nahi hua, Batfish ne dhoondha.</dd>
<dt>Disposition</dt><dd>traced packet ka anjaam: ACCEPTED, NO_ROUTE aur aur bhi.</dd>
<dt>HALF_OPEN</dt><dd>ek side par configured BGP session jiska peer match nahi karta.</dd>
<dt>Gate</dt><dd>aisi script jiska exit code tay karta hai ki change aage badh sakta hai ya nahi.</dd>
</dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li><code>validate()</code> valid hone par None return karta hai aur na hone par <code>ValidationError</code> raise karta hai; kharab schema <code>SchemaError</code> raise karta hai.</li>
<li>JSON Schema types mein strict hai: "65003" aur 65003 alag hain. Object band karne ke liye <code>additionalProperties: false</code> chahiye.</li>
<li>Batfish ko <code>configs/</code> wala folder chahiye; node ke naam lower case; API port 9996.</li>
<li>Ek typo ek undefined reference aur milte-julte naam ka unused structure banata hai.</li>
<li>Batfish tables mein BGP session har side se ek baar dikhta hai.</li>
<li>deepdiff paths aise dikhte hain <code>root['j1']['1.1.1.1/32']</code>; <code>dictionary_item_removed</code> mein paths hain, values nahi.</li>
<li>Offline check pass hona configuration se bhavishyavani hai, live network ka naap nahi.</li>
</ul>

<h3>Cheat sheet</h3>
<pre class="code">from jsonschema import Draft202012Validator, FormatChecker
from jsonschema.exceptions import best_match
v = Draft202012Validator(schema, format_checker=FormatChecker())
errors = sorted(v.iter_errors(data), key=lambda e: list(e.absolute_path))
err.message  err.absolute_path  err.json_path  err.validator

from pybatfish.client.session import Session
bf = Session(host="localhost"); bf.set_network("nk-lab")
bf.init_snapshot("candidate", name="candidate", overwrite=True)
bf.q.undefinedReferences().answer(snapshot="candidate").frame()
bf.q.parseWarning()  bf.q.unusedStructures()  bf.q.fileParseStatus()
bf.q.bgpSessionStatus()  bf.q.bgpSessionCompatibility()
bf.q.routes(nodes="e1", protocols="bgp", network="192.0.2.0/24")
bf.q.traceroute(startLocation="e1", headers=HeaderConstraints(dstIps="192.0.2.1"))
frame.to_dict("records")

from deepdiff import DeepDiff
d = DeepDiff(old, new, ignore_order=True, ignore_string_case=True,
             exclude_paths=[...], include_paths=[...], significant_digits=1, verbose_level=2)
d.pretty()  d.affected_root_keys  bool(d)  d.get("dictionary_item_removed", [])</pre>

<h3>Lab aur real gear, ek jagah</h3>
<table class="cmp"><tr><th>Topic</th><th>Lab</th><th>Real gear</th></tr>
<tr><td>Batfish service</td><td>built in, hamesha on</td><td>ports 9996 aur 9997 ka container</td></tr>
<tr><td>Messages</td><td>screen par print</td><td>log</td></tr>
<tr><td>Vendors parse</td><td>IOS, IOS XE, EOS, Junos</td><td>kaafi zyada</td></tr>
<tr><td>Data plane</td><td>best effort (BGP, OSPF, static)</td><td>poora model</td></tr>
<tr><td>deepdiff</td><td>text view aur aam options</td><td>tree view, Delta, DeepHash bhi</td></tr>
<tr><td>jsonschema</td><td>4.23 jaisa, local references</td><td>remote references, zyada formats</td></tr></table>

<div class="scn"><h4>Interview whiteboard</h4><p>Interviewer kehta hai Cisco aur Juniper ke across route-map naam ka typo production tak pahunchne se rokna hai. Aap paanch stages banate ho, har ek ke peeche ka tool batate ho, aur gate ke baad exit code aur confirmed commit par khatam karte ho. Aap batate ho ki gate kya nahi dekh sakta. Woh sheet par "limits jaanta hai" likhte hain.</p><p><b>Lesson:</b> apne checks ki limits batana senior lagta hai, kamzor nahi.</p></div>

<div class="iv"><p class="q">"Offline validation kahan khatam hota hai aur live verification kahan shuru?"</p><p>Offline checks configs aur intent se anumaan lagate hain aur change se pehle chalte hain. Live verification change ke baad asli device ko naapti hai, snapshots aur checks ke saath jaise adv-junos-validate mein. Mujhe dono chahiye: gate saaf faults rokne ke liye, aur confirmed commit plus post-check woh pakadne ke liye jo model nahi jaan sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Teen sawaal, teen tools: shape jsonschema se, consistency aur behaviour Batfish se, farak deepdiff se.</li>
<li>Gate matlab stages, reasons, report aur exit code.</li>
<li>Naam exact hote hain; ek typo undefined aur unused ki jodi banata hai.</li>
<li>Offline checks anumaan lagate hain; live checks naapte hain. Dono use karo.</li>
<li>Track mein aage: adv-vault aisi scripts ko run time par secrets deta hai, aur baad ke modules gate ko pipeline mein rakhte hain.</li>
</ul></div>
`}};export{e as default};