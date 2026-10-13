var e={id:`summary`,h:{en:`Summary, checklist and cheat-sheet`,hi:`Summary, checklist aur cheat-sheet`},body:{en:`
<p>You started this module able to send a command over SSH. You can now open a NETCONF session, learn what a device can do, read and change configuration in a controlled way, protect yourself against your own mistakes, read errors precisely, and write one function that works on two vendors. This chapter is the one to come back to before an exam or a change window.</p>

<h3>An analogy: the pilot's checklist</h3>
<p>Pilots do not trust memory for the things that matter. Before every flight they run through the same list, whether it is their first flight of the day or the tenth. Your change script is the checklist, written in Python: the same steps every time, in the same order, on every device.</p>

<h3>What you can now do</h3>
<ul>
<li>Explain that NETCONF is an XML protocol over an SSH subsystem on <b>TCP 830</b>, started with a hello that carries capabilities and a <b>session-id</b>, with a <b>message-id</b> on every RPC.</li>
<li>Connect with <code>manager.connect()</code> using <code>device_params</code>, <code>allow_agent=False</code>, <code>look_for_keys=False</code>, and know the production setting for <code>hostkey_verify</code>.</li>
<li>Read <code>m.server_capabilities</code> and choose the workflow: candidate, or writable-running.</li>
<li>Read with <code>get_config</code> and <code>get</code>, using subtree filters, and explain what each returns.</li>
<li>Change with <code>edit_config</code> and the operations merge, replace, create, delete and remove, and say which are safe to repeat.</li>
<li>Use the candidate datastore: lock, discard, edit, compare, validate, commit, unlock.</li>
<li>Use <code>commit(confirmed=True, timeout=...)</code>, <code>commit()</code> and <code>cancel_commit()</code>, and confirm only after a <b>new</b> session works.</li>
<li>Catch <code>RPCError</code> and decide from the tag; handle the other ncclient exceptions separately.</li>
<li>Write one idempotent function for IOS XE and Junos that reads, writes, reads back and exits with a code.</li>
<li>Troubleshoot a change in stages, and verify later than the rollback timer.</li></ul>

<h3>The skeleton to remember</h3>
<p>Thirteen numbered comments are the whole module in one block. Anything you build later is a variation on it.</p>
<pre class="code"><span class="c"># The skeleton of a safe NETCONF change - both workflows in one place</span>
from ncclient.operations import RPCError
from ncutil import connect

with connect("J1") as m:                                 <span class="c"># 1. connect: port 830, device_params for the vendor</span>
    if ":candidate" not in m.server_capabilities:        <span class="c"># 2. ask first</span>
        raise SystemExit("this device has no candidate: use the running workflow")
    before = m.get_config(source="running", filter=("subtree", FLT)).data   <span class="c"># 3. read, filtered</span>
    try:
        with m.locked("candidate"):                      <span class="c"># 4. lock, released on any exit</span>
            m.discard_changes()                          <span class="c"># 5. start from a clean draft</span>
            m.edit_config(target="candidate", config=CFG)  <span class="c"># 6. edit the draft only</span>
            print(m.compare_configuration().xpath("//configuration-output")[0].text)  <span class="c"># 7. read the diff</span>
            m.validate(source="candidate")               <span class="c"># 8. check without applying</span>
            m.commit(confirmed=True, timeout="60")       <span class="c"># 9. live, with a timer</span>
        after = m.get_config(source="running", filter=("subtree", FLT)).data   <span class="c"># 10. read back</span>
        # 11. a NEW session proves access; only then:
        m.commit()                                       <span class="c"># 12. confirm</span>
    except RPCError as err:                              <span class="c"># 13. decide from err.tag</span>
        print(err.tag, err.message)</pre>

<h3>Cheat-sheet: calls and what they need</h3>
<table class="cmp"><tr><th>Call</th><th>Purpose</th><th>Needs</th></tr>
<tr><td><code>manager.connect(...)</code></td><td>Open the session, port 830</td><td>Subsystem on the device</td></tr>
<tr><td><code>m.server_capabilities</code></td><td>Read the hello list</td><td></td></tr>
<tr><td><code>m.get_config(source, filter)</code></td><td>Configuration only</td><td></td></tr>
<tr><td><code>m.get(filter)</code></td><td>Configuration and state</td><td></td></tr>
<tr><td><code>m.edit_config(target, config)</code></td><td>Change a datastore</td><td><code>:candidate</code> or <code>:writable-running</code></td></tr>
<tr><td><code>m.lock / m.unlock / m.locked</code></td><td>Exclusive use of a datastore</td><td></td></tr>
<tr><td><code>m.validate(source)</code></td><td>Check without applying</td><td><code>:validate</code></td></tr>
<tr><td><code>m.commit()</code></td><td>Make the candidate live; or confirm</td><td><code>:candidate</code></td></tr>
<tr><td><code>m.commit(confirmed=True, timeout)</code></td><td>Live for a trial period</td><td><code>:confirmed-commit</code></td></tr>
<tr><td><code>m.cancel_commit()</code></td><td>Revert a pending confirmed commit</td><td><code>:confirmed-commit</code></td></tr>
<tr><td><code>m.discard_changes()</code></td><td>Reset candidate to running</td><td><code>:candidate</code></td></tr>
<tr><td><code>m.compare_configuration()</code></td><td>Junos diff</td><td><code>device_params</code> name <code>junos</code></td></tr>
<tr><td><code>m.save_config()</code></td><td>IOS XE running to startup</td><td><code>device_params</code> name <code>iosxe</code></td></tr></table>

<h3>Glossary</h3>
<dl class="terms">
<dt>Capability</dt><dd>A feature or model the server announces in its hello.</dd>
<dt>Datastore</dt><dd>A place configuration lives: running, candidate, startup.</dd>
<dt>Candidate</dt><dd>A draft copy of the configuration; only <code>commit</code> makes it live.</dd>
<dt>Subtree filter</dt><dd>An XML skeleton that selects the part of the data you want.</dd>
<dt>Operation</dt><dd>The <code>nc:operation</code> attribute: merge, replace, create, delete, remove.</dd>
<dt>Confirmed commit</dt><dd>A commit that reverts after a timeout unless confirmed.</dd>
<dt>Idempotent</dt><dd>Safe to repeat: the second run changes nothing more.</dd>
<dt>RPCError</dt><dd>The exception made from an <code>rpc-error</code> reply; decide on its <code>tag</code>.</dd>
<dt>Read-back</dt><dd>Reading the state after a write to prove it is what you asked for.</dd></dl>

<h3>Most tested facts</h3>
<ul>
<li>NETCONF: SSH subsystem <code>netconf</code>, port 830; messages are XML; RESTCONF is separate.</li>
<li>Candidate needs <code>:candidate</code>; confirmed commit needs <code>:candidate</code> and <code>:confirmed-commit</code>.</li>
<li>Default <code>edit_config</code> operation is merge. create and delete are strict; remove is not.</li>
<li><code>lock-denied</code> carries the session-id of the holder.</li>
<li>Timeout is seconds in the RPC, minutes in the Junos CLI log. Default 600 seconds.</li>
<li>A timeout means unknown: reconnect and read back.</li></ul>

<h3>In the lab and on real gear</h3>
<p>The lab is built to behave like real devices, but a few things differ, and you should know which, so you do not carry a lab habit into production:</p>
<ul>
<li>The lab clock is virtual. After a <code>sleep</code> the next NETCONF call lets time catch up, which is why <code>wait.py</code> makes a call after sleeping. Real time just passes.</li>
<li>R1 (IOS XE) has no candidate here. Newer real IOS XE releases can offer one. Always read the capabilities first.</li>
<li>J1 offers only base:1.0 here. Real Junos usually offers base:1.1 as well.</li>
<li>The IOS XE error texts are the lab's own wording. The <b>tags</b> (invalid-value, data-exists, data-missing) are standard; the messages differ on real devices.</li>
<li>The lab accepts a simple XPath without namespace prefixes on R1. A real device is stricter about namespaces, and the subtree filter is the portable choice.</li>
<li>On R1, a merge of a new IP address replaces the old primary address. A real ietf-ip list may keep both; always read back.</li>
<li>A second <code>delete</code> of a missing Junos statement returns ok here. Real Junos may warn; use <code>remove</code>.</li>
<li>Here a confirmed commit reverts by the timer. The standard also says it reverts if the session that made it closes (unless persistent), so do not use a short-lived second session to confirm.</li>
<li>Python tracebacks in the lab include ncclient internal frames; real ones differ. Read the last line and your own frames.</li></ul>

<div class="warn"><p><b>Common mistake.</b> Learning the lab by heart. The lasting skills are the method (ask, read, lock, diff, validate, commit confirmed, verify) and reading the error tag, not the lab's exact messages.</p></div>
<div class="exam"><p><b>Exam trap.</b> Questions often describe a symptom and ask for the cause. Map it: "Channel closed" is the wrong port or no subsystem; "lock-denied" is another session; "change gone after a minute" is a confirmed commit never confirmed; "MissingCapabilityError" is the capability list.</p></div>

<div class="scn"><h4>Handing over the change script</h4><p>You are leaving the team and a colleague takes over your interface script. They ask what to check before they run it on a new site. You answer with five items: the capabilities of the new model, whether the interface name format is the same, the commit-confirmed timer against the site's latency, a dry run that stops after the diff, and the separate verifier scheduled after the timer.</p><p><b>Lesson:</b> a script's real documentation is the list of assumptions it checks.</p></div>

<div class="iv"><p class="q">"Walk me through a safe configuration change over NETCONF."</p><p>I connect on port 830, read the capabilities and pick the workflow. I read the current state with a filter; if it already matches, I stop. Then I lock the candidate, discard old edits, edit, read the diff, validate and commit confirmed with a short timer. I read the state back and open a new session to prove access; only then I confirm. Errors are handled by tag, and a separate check later proves the change survived.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Ask (capabilities), read (filtered), lock, edit, diff, validate, commit confirmed, read back, new session, confirm.</li>
<li>Choose the workflow from capabilities, not from the vendor name alone.</li>
<li>merge, replace and remove are repeatable; create and delete are strict.</li>
<li>Decide on <code>err.tag</code>; a timeout is an unknown.</li>
<li>Verify with a separate run after the rollback timer.</li>
</ul></div>
`,hi:`
<p>Is module ke shuru mein aap SSH par command bhej sakte the. Ab aap NETCONF session khol sakte ho, jaan sakte ho ki device kya kar sakta hai, configuration ko controlled tareeke se padh aur badal sakte ho, apni galtiyon se khud ko bacha sakte ho, errors ko precisely padh sakte ho, aur ek aisa function likh sakte ho jo do vendors par chalta hai. Exam ya change window se pehle yeh chapter dobara kholne wala hai.</p>

<h3>Analogy: pilot ki checklist</h3>
<p>Pilots zaroori cheezon ke liye yaaddasht par bharosa nahi karte. Har flight se pehle woh wahi list chalate hain, chahe din ki pehli flight ho ya dasvi. Aapki change script woh checklist hai, Python mein likhi: har baar wahi steps, wahi order, har device par.</p>

<h3>Aap ab kya kar sakte ho</h3>
<ul>
<li>Samjha sakte ho ki NETCONF <b>TCP 830</b> par SSH subsystem ke upar XML protocol hai, jo capabilities aur <b>session-id</b> wale hello se shuru hota hai, aur har RPC par <b>message-id</b> hota hai.</li>
<li><code>manager.connect()</code> se <code>device_params</code>, <code>allow_agent=False</code>, <code>look_for_keys=False</code> ke saath connect kar sakte ho, aur <code>hostkey_verify</code> ki production setting jaante ho.</li>
<li><code>m.server_capabilities</code> padhkar workflow chun sakte ho: candidate, ya writable-running.</li>
<li>Subtree filters ke saath <code>get_config</code> aur <code>get</code> se padh sakte ho, aur samjha sakte ho har ek kya deta hai.</li>
<li><code>edit_config</code> aur operations merge, replace, create, delete, remove se badal sakte ho, aur bata sakte ho kaun repeat karna safe hai.</li>
<li>Candidate datastore use kar sakte ho: lock, discard, edit, compare, validate, commit, unlock.</li>
<li><code>commit(confirmed=True, timeout=...)</code>, <code>commit()</code> aur <code>cancel_commit()</code> use kar sakte ho, aur confirm sirf tab karte ho jab <b>naya</b> session chal jaye.</li>
<li><code>RPCError</code> pakadkar tag se decide kar sakte ho; ncclient ke baaki exceptions alag handle karte ho.</li>
<li>IOS XE aur Junos ke liye ek idempotent function likh sakte ho jo padhta hai, likhta hai, read back karta hai aur code ke saath exit karta hai.</li>
<li>Change ko stages mein troubleshoot kar sakte ho, aur rollback timer ke baad verify karte ho.</li></ul>

<h3>Yaad rakhne wala skeleton</h3>
<p>13 numbered comments poora module ek block mein hain. Aap aage jo bhi banaoge woh iska variation hoga.</p>
<pre class="code"><span class="c"># The skeleton of a safe NETCONF change - both workflows in one place</span>
from ncclient.operations import RPCError
from ncutil import connect

with connect("J1") as m:                                 <span class="c"># 1. connect: port 830, device_params for the vendor</span>
    if ":candidate" not in m.server_capabilities:        <span class="c"># 2. ask first</span>
        raise SystemExit("this device has no candidate: use the running workflow")
    before = m.get_config(source="running", filter=("subtree", FLT)).data   <span class="c"># 3. read, filtered</span>
    try:
        with m.locked("candidate"):                      <span class="c"># 4. lock, released on any exit</span>
            m.discard_changes()                          <span class="c"># 5. start from a clean draft</span>
            m.edit_config(target="candidate", config=CFG)  <span class="c"># 6. edit the draft only</span>
            print(m.compare_configuration().xpath("//configuration-output")[0].text)  <span class="c"># 7. read the diff</span>
            m.validate(source="candidate")               <span class="c"># 8. check without applying</span>
            m.commit(confirmed=True, timeout="60")       <span class="c"># 9. live, with a timer</span>
        after = m.get_config(source="running", filter=("subtree", FLT)).data   <span class="c"># 10. read back</span>
        # 11. a NEW session proves access; only then:
        m.commit()                                       <span class="c"># 12. confirm</span>
    except RPCError as err:                              <span class="c"># 13. decide from err.tag</span>
        print(err.tag, err.message)</pre>

<h3>Cheat-sheet: calls aur unhe kya chahiye</h3>
<table class="cmp"><tr><th>Call</th><th>Maksad</th><th>Kya chahiye</th></tr>
<tr><td><code>manager.connect(...)</code></td><td>Session kholo, port 830</td><td>Device par subsystem</td></tr>
<tr><td><code>m.server_capabilities</code></td><td>Hello list padho</td><td></td></tr>
<tr><td><code>m.get_config(source, filter)</code></td><td>Sirf configuration</td><td></td></tr>
<tr><td><code>m.get(filter)</code></td><td>Configuration aur state</td><td></td></tr>
<tr><td><code>m.edit_config(target, config)</code></td><td>Datastore badlo</td><td><code>:candidate</code> ya <code>:writable-running</code></td></tr>
<tr><td><code>m.lock / m.unlock / m.locked</code></td><td>Datastore ka exclusive use</td><td></td></tr>
<tr><td><code>m.validate(source)</code></td><td>Apply kiye bina check</td><td><code>:validate</code></td></tr>
<tr><td><code>m.commit()</code></td><td>Candidate ko live karo; ya confirm</td><td><code>:candidate</code></td></tr>
<tr><td><code>m.commit(confirmed=True, timeout)</code></td><td>Trial period ke liye live</td><td><code>:confirmed-commit</code></td></tr>
<tr><td><code>m.cancel_commit()</code></td><td>Pending confirmed commit revert</td><td><code>:confirmed-commit</code></td></tr>
<tr><td><code>m.discard_changes()</code></td><td>Candidate ko running jaisa karo</td><td><code>:candidate</code></td></tr>
<tr><td><code>m.compare_configuration()</code></td><td>Junos diff</td><td><code>device_params</code> naam <code>junos</code></td></tr>
<tr><td><code>m.save_config()</code></td><td>IOS XE running se startup</td><td><code>device_params</code> naam <code>iosxe</code></td></tr></table>

<h3>Glossary</h3>
<dl class="terms">
<dt>Capability</dt><dd>Woh feature ya model jo server apne hello mein announce karta hai.</dd>
<dt>Datastore</dt><dd>Jahan configuration rehti hai: running, candidate, startup.</dd>
<dt>Candidate</dt><dd>Configuration ki draft copy; sirf <code>commit</code> use live karta hai.</dd>
<dt>Subtree filter</dt><dd>XML dhancha jo data ka chaha hua hissa chunta hai.</dd>
<dt>Operation</dt><dd><code>nc:operation</code> attribute: merge, replace, create, delete, remove.</dd>
<dt>Confirmed commit</dt><dd>Aisa commit jo confirm na hone par timeout ke baad revert ho jaata hai.</dd>
<dt>Idempotent</dt><dd>Repeat karna safe: doosri run aur kuch nahi badalti.</dd>
<dt>RPCError</dt><dd><code>rpc-error</code> reply se bana exception; uske <code>tag</code> par decide karo.</dd>
<dt>Read-back</dt><dd>Write ke baad state padhna ki woh wahi hai jo maanga tha.</dd></dl>

<h3>Sabse zyada poochhe jaane wale facts</h3>
<ul>
<li>NETCONF: SSH subsystem <code>netconf</code>, port 830; messages XML hain; RESTCONF alag hai.</li>
<li>Candidate ko <code>:candidate</code> chahiye; confirmed commit ko <code>:candidate</code> aur <code>:confirmed-commit</code>.</li>
<li><code>edit_config</code> ka default operation merge hai. create aur delete strict hain; remove nahi.</li>
<li><code>lock-denied</code> holder ka session-id le jaata hai.</li>
<li>Timeout RPC mein seconds, Junos CLI log mein minutes. Default 600 seconds.</li>
<li>Timeout ka matlab unknown: reconnect karo aur read back.</li></ul>

<h3>Lab mein aur asli gear par</h3>
<p>Lab asli devices jaisa behave karne ke liye bana hai, par kuch cheezein alag hain, aur aapko pata hona chahiye kaunsi, taaki lab ki aadat production mein na le jaao:</p>
<ul>
<li>Lab clock virtual hai. <code>sleep</code> ke baad agli NETCONF call time ko catch up karne deti hai, isliye <code>wait.py</code> sone ke baad call karta hai. Asli time bas guzarta hai.</li>
<li>R1 (IOS XE) mein yahan candidate nahi hai. Naye asli IOS XE releases ek de sakte hain. Capabilities hamesha pehle padho.</li>
<li>J1 yahan sirf base:1.0 deta hai. Asli Junos aam taur par base:1.1 bhi deta hai.</li>
<li>IOS XE ke error texts lab ke apne shabd hain. <b>Tags</b> (invalid-value, data-exists, data-missing) standard hain; asli devices par messages alag hote hain.</li>
<li>Lab R1 par namespace prefix ke bina simple XPath maan leta hai. Asli device namespaces mein zyada sakht hai, aur subtree filter portable choice hai.</li>
<li>R1 par naye IP address ka merge purane primary address ko replace karta hai. Asli ietf-ip list dono rakh sakti hai; hamesha read back karo.</li>
<li>Yahan Junos ke missing statement ka doosra <code>delete</code> ok deta hai. Asli Junos warn kar sakta hai; <code>remove</code> use karo.</li>
<li>Yahan confirmed commit timer se revert hota hai. Standard yeh bhi kehta hai ki jis session ne banaya woh band ho jaye to revert hota hai (persistent na ho to), isliye confirm karne ke liye jaldi band hone wala doosra session use mat karo.</li>
<li>Lab ke Python tracebacks mein ncclient internal frames hote hain; asli wale alag hote hain. Aakhri line aur apne frames padho.</li></ul>

<div class="warn"><p><b>Common mistake.</b> Lab ko ratna. Tikne wali skills method hain (poocho, padho, lock, diff, validate, commit confirmed, verify) aur error tag padhna, lab ke exact messages nahi.</p></div>
<div class="exam"><p><b>Exam trap.</b> Sawal aksar symptom batakar wajah poochhte hain. Map karo: "Channel closed" galat port ya subsystem nahi; "lock-denied" doosra session; "ek minute baad change gayab" confirmed commit confirm nahi hua; "MissingCapabilityError" capability list.</p></div>

<div class="scn"><h4>Change script hand over karna</h4><p>Aap team chhod rahe ho aur ek colleague aapki interface script sambhal raha hai. Woh poochta hai naye site par chalane se pehle kya check karna hai. Aap paanch cheezein batate ho: naye model ki capabilities, interface naam ka format wahi hai ya nahi, commit-confirmed timer site ki latency ke saamne, ek dry run jo diff ke baad ruk jaye, aur timer ke baad schedule hua alag verifier.</p><p><b>Lesson:</b> script ki asli documentation woh assumptions ki list hai jo woh check karti hai.</p></div>

<div class="iv"><p class="q">"NETCONF par safe configuration change step by step samjhao."</p><p>Port 830 par connect karta hoon, capabilities padhkar workflow chunta hoon. Filter ke saath maujooda state padhta hoon; pehle se match kare to ruk jaata hoon. Phir candidate lock, purane edits discard, edit, diff padhna, validate aur chhote timer ke saath commit confirmed. State read back karta hoon aur access saabit karne ke liye naya session kholta hoon; tabhi confirm karta hoon. Errors tag se handle hote hain, aur baad ki alag check saabit karti hai ki change tika.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Poocho (capabilities), padho (filtered), lock, edit, diff, validate, commit confirmed, read back, naya session, confirm.</li>
<li>Workflow capabilities se chuno, sirf vendor ke naam se nahi.</li>
<li>merge, replace aur remove repeat karne layak; create aur delete strict.</li>
<li><code>err.tag</code> par decide karo; timeout ek unknown hai.</li>
<li>Rollback timer ke baad alag run se verify karo.</li>
</ul></div>
`}};export{e as default};