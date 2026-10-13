var e={id:`change-rollback`,h:{en:`Changing safely: dry run, commit, read back and roll back`,hi:`Safely change karna: dry run, commit, read back aur rollback`},body:{en:`
<p>The gate said yes. Now the toolkit touches devices, and everything that matters changes: a mistake is no longer a bad file, it is a router in the wrong state. The change stage follows one sentence: <b>look first, change second, read back third, and be able to undo</b>. In <code>adv-napalm</code> you built the pieces for one change; here they become the stage of a pipeline that runs on every device in scope.</p>

<h3>One Nornir task per device</h3>
<pre class="code">def change(task, intents, texts, apply=False):
    doc = intents[task.host.name]
    junos = doc["platform"] == "junos"
    device = task.host.get_connection("napalm", task.nornir.config)
    device.load_merge_candidate(config=texts[task.host.name])
    diff = device.compare_config()
    if not diff.strip():
        device.discard_config()
        return Result(host=task.host, result="already compliant", changed=False)
    if not apply:
        device.discard_config()
        return Result(host=task.host, result="would change", diff=diff, changed=True)
<span class="hl">    if junos:
        device.commit_config(revert_in=60, message="mvtoolkit")      # a confirmed commit: Junos undoes it unless we confirm
    else:
        device.commit_config()</span>
    problems = problems_in(doc, state_of(device))
    if settle(device, problems, junos) == "rolled back":
        return Result(host=task.host, result="rolled back: " + "; ".join(problems), diff=diff, failed=True)
    return Result(host=task.host, result="committed and verified", diff=diff, changed=True)</pre>
<p>Read it as five decisions. (1) <b>Compare first</b>: no difference means nothing happens, and the run reports <i>already compliant</i>, which makes the toolkit safe to run twice. (2) <b>Plan and apply are one code path</b>: the only difference is the line that commits, so a plan shows what an apply will do. (3) <b>Junos uses a confirmed commit</b>: the commit is automatic-undo unless confirmed. (4) <b>Read back through the getters</b>, not through the candidate you just sent. (5) <b>Keep or roll back</b> on the result of the read-back.</p>

<h3>The decisions live in a module with no devices</h3>
<pre class="code">def settle(device, problems, junos):
    """Keep the change when the read-back is clean, otherwise roll it back."""
    if problems:
        device.rollback()
        return "rolled back"
<span class="hl">    if junos:
        device.confirm_commit()</span>
    return "kept"</pre>
<p>This function and <code>problems_in()</code> sit in <code>safety.py</code> and import neither Nornir nor NAPALM. That is a design choice for testing: a <code>FakeDevice</code> with two methods can prove that a bad read-back rolls back, and the proof runs in a tenth of a second. The Nornir task is the thin shell around well-tested logic.</p>

<h3>The three runs you do on every change</h3>
<pre class="out">AUTO01$ python3 mvtool.py plan; echo "exit code: $?"
NGP-BR-J1    would change
    [edit system]
    +   syslog {
    +       host 10.99.0.60 {
    +           any notice;
    +       }
    +   }
    [edit system ntp]
    +   server 10.99.0.61;
    [edit interfaces lo0 unit 0]
    +   description "NGP-BR-J1 loopback";
NGP-BR-R1    would change
    +ntp server 10.99.0.61
    +logging host 10.99.0.60
2 ok, 0 failed
exit code: 0</pre>
<p>The plan shows the real diff per vendor, in each vendor's own notation, and changes nothing. A person reads this before approving the apply. Now the proof that the safety net works, before you rely on it: delete the NTP line from the candidate files, so that the device will not end up in the state the intent wants.</p>
<pre class="out">AUTO01$ sed -i '/10.99.0.61/d' build/configs/NGP-BR-R1.cfg build/configs/NGP-BR-J1.cfg
AUTO01$ python3 mvtool.py apply; echo "exit code: $?"
GATE PASSED
NGP-BR-J1    rolled back: ntp server 10.99.0.61 is missing
NGP-BR-R1    rolled back: ntp server 10.99.0.61 is missing
0 ok, 2 failed
exit code: 1</pre>
<p>The gate passed (the files are valid), both devices committed, the read-back disagreed with the intent, and both devices went back. Then the real apply: <i>committed and verified</i> on both, and a second apply says <i>already compliant</i>.</p>

<div class="warn"><p><b>Exam trap: IOS has no commit confirm.</b> NAPALM's IOS driver raises <code>NotImplementedError</code> for <code>revert_in</code>, so IOS XE relies on the read-back and <code>rollback()</code>. Junos can undo by itself: with <code>revert_in=60</code> the router undoes the commit after a minute (the lab rounds up to whole minutes) unless <code>confirm_commit()</code> runs. If your tool crashes between commit and confirm, the router heals itself. If your tool forgets to confirm, the router reverts a change that your report called a success. Read the evidence the router gives you after a night run.</p></div>

<div class="note"><p><b>Lab differences.</b> In the lab, an IOS rollback restores global commands (ntp, logging) but left a description that had been added under an interface. Real IOS rolls back the whole configuration. The demo above uses only global lines for that reason.</p></div>

<div class="scn"><h4>The change that undid itself</h4><p>After a night run the report said "committed and verified" for every Junos router. By morning the new NTP servers were missing on all of them. The tool committed with a confirm timer, read the state back, found it correct and printed success, but never called the confirm. Ten minutes later the routers rolled back to the previous state, exactly as designed. The bug was one missing line, and the guard was a unit test that fails when a clean read-back on Junos does not confirm.</p><p><b>Lesson:</b> a safety mechanism you do not finish is a time bomb. Test the final step of the safe path as carefully as the failure path.</p></div>

<div class="iv"><p class="q">"How does your tool make a change safe?"</p><p>It loads a candidate and compares first; no difference means no commit. Plan and apply share one path. I commit with an auto-revert where the platform has one, read the device back with the same getters on every vendor, and keep the change only when the read-back matches the intent; otherwise I roll back and fail the host with the reason. The decisions are in a module with no network, covered by unit tests.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Compare first; no difference means no commit, so a second run is harmless.</li>
<li>Plan and apply are one code path; only the commit line differs.</li>
<li>Junos: confirmed commit plus an explicit confirm after a clean read-back. IOS: read-back plus rollback.</li>
<li>Keep the decisions free of Nornir and NAPALM so a fake device can test them.</li>
<li>Prove the rollback works before you need it.</li>
</ul></div>
`,hi:`
<p>Gate ne haan kaha. Ab toolkit devices ko chhooti hai, aur jo kuch matter karta hai badal jata hai: galti ab kharab file nahi, galat state mein router hai. Change stage ek vaakya ko follow karta hai: <b>pehle dekho, phir badlo, phir wapas padho, aur undo kar sako</b>. <code>adv-napalm</code> mein aapne ek change ke tukde banaye the; yahan woh pipeline ka stage ban jaate hain jo scope ke har device par chalta hai.</p>

<h3>Har device ke liye ek Nornir task</h3>
<pre class="code">def change(task, intents, texts, apply=False):
    doc = intents[task.host.name]
    junos = doc["platform"] == "junos"
    device = task.host.get_connection("napalm", task.nornir.config)
    device.load_merge_candidate(config=texts[task.host.name])
    diff = device.compare_config()
    if not diff.strip():
        device.discard_config()
        return Result(host=task.host, result="already compliant", changed=False)
    if not apply:
        device.discard_config()
        return Result(host=task.host, result="would change", diff=diff, changed=True)
<span class="hl">    if junos:
        device.commit_config(revert_in=60, message="mvtoolkit")      # a confirmed commit: Junos undoes it unless we confirm
    else:
        device.commit_config()</span>
    problems = problems_in(doc, state_of(device))
    if settle(device, problems, junos) == "rolled back":
        return Result(host=task.host, result="rolled back: " + "; ".join(problems), diff=diff, failed=True)
    return Result(host=task.host, result="committed and verified", diff=diff, changed=True)</pre>
<p>Ise paanch faislon ki tarah padho. (1) <b>Pehle compare</b>: difference nahi to kuch nahi hota, aur run <i>already compliant</i> batata hai, jisse toolkit do baar chalana safe hai. (2) <b>Plan aur apply ek hi code path</b>: fark sirf commit wali line ka hai, isliye plan wahi dikhata hai jo apply karega. (3) <b>Junos confirmed commit use karta hai</b>: commit confirm na ho to apne aap undo ho jata hai. (4) <b>Getters se wapas padho</b>, bheje hue candidate se nahi. (5) Read-back ke result par <b>rakho ya rollback karo</b>.</p>

<h3>Faisle woh module jisme device nahi</h3>
<pre class="code">def settle(device, problems, junos):
    """Keep the change when the read-back is clean, otherwise roll it back."""
    if problems:
        device.rollback()
        return "rolled back"
<span class="hl">    if junos:
        device.confirm_commit()</span>
    return "kept"</pre>
<p>Yeh function aur <code>problems_in()</code> <code>safety.py</code> mein hain aur na Nornir na NAPALM import karte hain. Yeh testing ke liye design choice hai: do methods wala <code>FakeDevice</code> saabit kar sakta hai ki kharab read-back rollback karta hai, aur woh saabit second ke dasvein hisse mein chalta hai. Nornir task achhe test hue logic ke gird patla shell hai.</p>

<h3>Har change par teen runs</h3>
<pre class="out">AUTO01$ python3 mvtool.py plan; echo "exit code: $?"
NGP-BR-J1    would change
    [edit system]
    +   syslog {
    +       host 10.99.0.60 {
    +           any notice;
    +       }
    +   }
    [edit system ntp]
    +   server 10.99.0.61;
    [edit interfaces lo0 unit 0]
    +   description "NGP-BR-J1 loopback";
NGP-BR-R1    would change
    +ntp server 10.99.0.61
    +logging host 10.99.0.60
2 ok, 0 failed
exit code: 0</pre>
<p>Plan har vendor ka asli diff, us vendor ki apni notation mein dikhata hai, aur kuch badalta nahi. Apply approve karne se pehle insaan yeh padhta hai. Ab safety net kaam karta hai iska saboot, uspar bharosa karne se pehle: candidate files se NTP line hata do, taaki device us state mein na pahunche jo intent chahta hai.</p>
<pre class="out">AUTO01$ sed -i '/10.99.0.61/d' build/configs/NGP-BR-R1.cfg build/configs/NGP-BR-J1.cfg
AUTO01$ python3 mvtool.py apply; echo "exit code: $?"
GATE PASSED
NGP-BR-J1    rolled back: ntp server 10.99.0.61 is missing
NGP-BR-R1    rolled back: ntp server 10.99.0.61 is missing
0 ok, 2 failed
exit code: 1</pre>
<p>Gate pass hua (files valid hain), dono devices ne commit kiya, read-back intent se alag nikla, aur dono wapas gaye. Phir asli apply: dono par <i>committed and verified</i>, aur doosra apply <i>already compliant</i> kehta hai.</p>

<div class="warn"><p><b>Exam trap: IOS mein commit confirm nahi.</b> NAPALM ka IOS driver <code>revert_in</code> par <code>NotImplementedError</code> deta hai, isliye IOS XE read-back aur <code>rollback()</code> par chalta hai. Junos khud undo kar sakta hai: <code>revert_in=60</code> ke saath router ek minute baad commit undo karta hai jab tak <code>confirm_commit()</code> na chale (lab poore minute tak round up karta hai). Commit aur confirm ke beech tool crash ho to router khud theek ho jata hai. Tool confirm bhool jaye to router woh change wapas leta hai jise aapki report ne success kaha tha. Raat ki run ke baad router ka evidence padho.</p></div>

<div class="note"><p><b>Lab differences.</b> Lab mein IOS rollback global commands (ntp, logging) wapas karta hai par interface ke andar jodi gayi description chhod gaya. Asli IOS poori configuration wapas karta hai. Upar ka demo isi wajah se sirf global lines use karta hai.</p></div>

<div class="scn"><h4>Jo change khud undo ho gaya</h4><p>Raat ki run ke baad report ne har Junos router ke liye "committed and verified" kaha. Subah tak nayi NTP servers sab par gayab thin. Tool ne confirm timer ke saath commit kiya, state wapas padhi, sahi paayi aur success print kiya, par confirm kabhi call nahi kiya. Das minute baad routers pichli state par lauta gaye, bilkul design ke hisaab se. Bug ek missing line thi, aur guard ek unit test tha jo tab fail hota hai jab Junos par clean read-back confirm nahi karta.</p><p><b>Lesson:</b> jo safety mechanism poora na kiya jaye woh time bomb hai. Safe path ke aakhri step ko utni hi tarah test karo jitna failure path ko.</p></div>

<div class="iv"><p class="q">"Aapka tool change ko safe kaise banata hai?"</p><p>Woh candidate load karke pehle compare karta hai; difference nahi to commit nahi. Plan aur apply ek hi path share karte hain. Jahan platform mein auto-revert hai wahan us ke saath commit karta hoon, har vendor par same getters se device wapas padhta hoon, aur change tabhi rakhta hoon jab read-back intent se match kare; warna rollback karke host ko wajah ke saath fail karta hoon. Faisle network ke bina module mein hain, unit tests se covered.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle compare; difference nahi to commit nahi, isliye doosri run bekhatar hai.</li>
<li>Plan aur apply ek code path; sirf commit line alag.</li>
<li>Junos: confirmed commit aur clean read-back ke baad explicit confirm. IOS: read-back aur rollback.</li>
<li>Faisle Nornir aur NAPALM se door rakho taaki fake device unhe test kare.</li>
<li>Rollback ki zaroorat se pehle saabit karo ki woh kaam karta hai.</li>
</ul></div>
`}};export{e as default};