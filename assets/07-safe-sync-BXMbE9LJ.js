var e={id:`safe-sync`,h:{en:`The safe sync tool: diff, commit, verify, repeat`,hi:`Safe sync tool: diff, commit, verify, repeat`},body:{en:`<p>This is the practical chapter of Lab 1, steps 3 to 5. You now know the calls; the skill is the order you put them in. A change tool that is safe for 200 routers does five things every time: it shows the diff, commits only when there is something to commit, checks the result with a getter, undoes the change if the check fails, and returns an exit code your scheduler can read. These are the rules of <code>py-safepush</code>, rebuilt on NAPALM so they work on three vendors.</p>

<h3>An analogy: the pre-flight checklist</h3>
<p>A pilot does not take off because the plane looks fine. She reads the checklist, completes the checks in order, and aborts on the first item that is wrong. Your tool reads: <em>diff</em>, <em>decide</em>, <em>commit</em>, <em>verify</em>, <em>abort or confirm</em>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="sync flow">
<rect x="5" y="30" width="96" height="50" rx="8" fill="#bae6fd"/><text x="53" y="52" text-anchor="middle" class="svg-ink" font-size="13">load</text><text x="53" y="68" text-anchor="middle" class="svg-muted" font-size="10">merge candidate</text>
<rect x="117" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="165" y="52" text-anchor="middle" class="svg-ink" font-size="13">diff</text><text x="165" y="68" text-anchor="middle" class="svg-muted" font-size="10">compare_config</text>
<rect x="229" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="277" y="52" text-anchor="middle" class="svg-ink" font-size="13">decide</text><text x="277" y="68" text-anchor="middle" class="svg-muted" font-size="10">empty? --apply?</text>
<rect x="341" y="30" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="389" y="52" text-anchor="middle" class="svg-ink" font-size="13">commit</text><text x="389" y="68" text-anchor="middle" class="svg-muted" font-size="10">revert_in on Junos</text>
<rect x="453" y="30" width="86" height="50" rx="8" fill="#e2e8f0"/><text x="496" y="52" text-anchor="middle" class="svg-ink" font-size="13">verify</text><text x="496" y="68" text-anchor="middle" class="svg-muted" font-size="10">get_ntp_servers</text>
<rect x="555" y="30" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="595" y="52" text-anchor="middle" class="svg-ink" font-size="13">confirm</text><text x="595" y="68" text-anchor="middle" class="svg-muted" font-size="10">exit 0</text>
<line x1="101" y1="55" x2="117" y2="55" stroke="#64748b" stroke-width="2"/><line x1="213" y1="55" x2="229" y2="55" stroke="#64748b" stroke-width="2"/><line x1="325" y1="55" x2="341" y2="55" stroke="#64748b" stroke-width="2"/><line x1="437" y1="55" x2="453" y2="55" stroke="#64748b" stroke-width="2"/><line x1="539" y1="55" x2="555" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="229" y="105" width="96" height="40" rx="8" fill="#e2e8f0"/><text x="277" y="122" text-anchor="middle" class="svg-ink" font-size="13">discard</text><text x="277" y="138" text-anchor="middle" class="svg-muted" font-size="10">nothing to do</text><line x1="277" y1="80" x2="277" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="453" y="105" width="182" height="40" rx="8" fill="#fecaca"/><text x="544" y="130" text-anchor="middle" class="svg-ink" font-size="13">verify failed: rollback(), exit 1</text><line x1="496" y1="80" x2="496" y2="105" stroke="#dc2626" stroke-width="2"/>
</svg><p class="cap">Five checkpoints. Two of them can stop the change before or after the commit.</p></div>

<h3>The code</h3>
<p>The second half of <code>ntpsync.py</code> (the first half is in chapter 5). You append it with <code>cat &gt;&gt;</code> in the lab.</p>
<pre class="code">

def sync(name, servers, apply=False):
    """Diff first. Commit only when there is a diff and --apply was given. True when the device is right."""
    driver = DEVICES[name]["driver"]
    dev = open_device(name)
    try:
        try:
            dev.load_merge_candidate(config=candidate(driver, servers))
        except MergeConfigException as err:
            print("%s: the device refused the candidate: %s" % (name, err))
            return False
        diff = dev.compare_config()
        if not diff.strip():
            print("%s: already compliant, nothing to commit" % name)
            dev.discard_config()
            return True
        print("%s: diff before commit" % name)
        print(diff)
        if not apply:
            dev.discard_config()
            print("%s: dry run, candidate discarded" % name)
            return True
        if driver == "junos":
            dev.commit_config(revert_in=120, message="ntpsync")
        else:
            dev.commit_config()
        have = dev.get_ntp_servers()
        missing = [s for s in servers if s not in have]
        if missing:
            print("%s: VERIFY FAILED, missing %s - rolling back" % (name, missing))
            dev.rollback()
            return False
        if driver == "junos":
            dev.confirm_commit()
        print("%s: committed and verified: %s" % (name, sorted(have)))
        return True
    finally:
        dev.close()


if __name__ == "__main__":
    apply = "--apply" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("--")]
    results = [sync(n, WANT, apply) for n in names]
    sys.exit(0 if all(results) else 1)</pre>
<ul>
<li><b>MergeConfigException</b> is caught and reported; the function returns <code>False</code> and the exit code says so.</li>
<li><b>Empty diff</b> means "already compliant": the candidate is discarded and nothing is committed. That is what makes the tool <i>idempotent</i>.</li>
<li><b>Without <code>--apply</code></b> the tool is a dry run: it prints the diff and discards.</li>
<li><b>Junos</b> is committed with <code>revert_in=120</code> and a <code>message</code>, so the router rolls back alone if the script dies. Chapter 8 covers this. IOS and EOS get a plain <code>commit_config()</code>, because the lab drivers raise <code>NotImplementedError</code> for those arguments.</li>
<li><b>Verify</b> uses a getter, not the commit's silence. If a server is missing the tool calls <code>rollback()</code>.</li>
<li><b>Exit code</b>: <code>sys.exit(0)</code> only when every device is right.</li></ul>

<h3>Run it: dry run, apply, again</h3>
<pre class="out">AUTO01$ python3 ntpsync.py R1 J1
R1: diff before commit
+ntp server 10.99.0.61
R1: dry run, candidate discarded
J1: diff before commit
[edit system ntp]
+   server 10.99.0.61;
J1: dry run, candidate discarded</pre>
<p>The dry run prints both diffs and "candidate discarded". Nothing changed on the devices. Now the real run:</p>
<pre class="out">AUTO01$ python3 ntpsync.py R1 J1 --apply
R1: diff before commit
+ntp server 10.99.0.61
<span class="hl">R1: committed and verified: ['10.99.0.60', '10.99.0.61']</span>
J1: diff before commit
[edit system ntp]
+   server 10.99.0.61;
<span class="hl">J1: committed and verified: ['10.99.0.60', '10.99.0.61']</span></pre>
<p>Each device got one added line, and the getter read it back. On Junos the commit log shows what the tool did:</p>
<pre class="out">J1&gt; show system commit
0   2026-10-11 15:01:24 UTC by netops via netconf
1   2026-10-11 15:01:24 UTC by netops via netconf <span class="hl">commit confirmed, rollback in 2mins</span>
    ntpsync
2   2026-10-11 15:00:07 UTC by root via other</pre>
<p>Entry 1 is the confirmed commit with the message <code>ntpsync</code>; entry 0 is the confirming commit sent by <code>confirm_commit()</code>. The run that follows proves idempotence:</p>
<pre class="out">AUTO01$ python3 ntpsync.py R1 J1 --apply; echo "exit code: $?"
R1: already compliant, nothing to commit
J1: already compliant, nothing to commit
<span class="hl">exit code: 0</span></pre>
<p>"Already compliant, nothing to commit" on both, and exit code <code>0</code>. Run it from cron every hour and it changes nothing until something drifts, and then it repairs exactly that.</p>

<div class="note"><p><b>In the lab vs on real gear.</b> Lab IOS has no commit message and no confirm, so a real IOS XE tool also needs a different safety net: a pre-change backup (<code>get_config</code>) or the driver's own rollback. The lab Junos rounds <code>revert_in</code> up to whole minutes, so 120 seconds shows as 2mins.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Verifying with the same object that committed, so a broken management path is never noticed (open a new session for a real health check, as <code>adv-netconf</code> did); catching <code>Exception</code> and carrying on; committing when the diff is empty; returning exit 0 when a device failed.</p></div>

<div class="exam"><p><b>Exam trap.</b> Idempotent does not mean "never commits". It means a second run with the same input finds an empty diff and changes nothing.</p></div>

<div class="scn"><h4>One extra server, 40 routers, no outage</h4><p>The security team asked for a second NTP server on every router before an audit. The engineer ran the tool without <code>--apply</code> first and pasted the 40 diffs into the change ticket. Reviewers saw one added line each, except one router whose diff showed an unexpected parent line: a typo in its template. They fixed that one device by hand, ran with <code>--apply</code>, and the second run printed "already compliant" 40 times.</p><p><b>Lesson:</b> dry run, review, apply, run again. The second run is your proof.</p></div>

<div class="iv"><p class="q">"How do you make a configuration script idempotent?"</p><p>I compute the difference between desired and actual before I write. If compare_config is empty I do nothing and exit 0. If not, I commit, verify with a getter, and a second run must print "nothing to commit". The diff is the idempotence test.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: load, diff, decide, commit, verify, confirm or roll back.</li>
<li>Empty diff means do nothing; that is idempotence.</li>
<li>Dry run is the default; <code>--apply</code> is explicit.</li>
<li>Verify with a getter and roll back on failure.</li>
<li>Return a non-zero exit code when any device is wrong.</li></ul></div>`,hi:`<p>Yeh Lab 1, steps 3 se 5 ka practical chapter hai. Aap calls jaan gaye ho; hunar un calls ke order mein hai. 200 routers ke liye safe change tool har baar paanch kaam karta hai: diff dikhata hai, tabhi commit karta hai jab commit karne ko kuch ho, result ko getter se check karta hai, check fail ho to change undo karta hai, aur aisa exit code deta hai jo aapka scheduler padh sake. Yeh <code>py-safepush</code> ke niyam hain, NAPALM par dobara bane taaki teen vendors par chalein.</p>

<h3>Ek analogy: pre-flight checklist</h3>
<p>Pilot isliye take off nahi karta ki jahaz theek dikhta hai. Woh checklist padhti hai, checks ko order mein poora karti hai, aur pehli galat cheez par abort karti hai. Aapka tool padhta hai: <em>diff</em>, <em>decide</em>, <em>commit</em>, <em>verify</em>, <em>abort ya confirm</em>.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="sync flow">
<rect x="5" y="30" width="96" height="50" rx="8" fill="#bae6fd"/><text x="53" y="52" text-anchor="middle" class="svg-ink" font-size="13">load</text><text x="53" y="68" text-anchor="middle" class="svg-muted" font-size="10">merge candidate</text>
<rect x="117" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="165" y="52" text-anchor="middle" class="svg-ink" font-size="13">diff</text><text x="165" y="68" text-anchor="middle" class="svg-muted" font-size="10">compare_config</text>
<rect x="229" y="30" width="96" height="50" rx="8" fill="#fde68a"/><text x="277" y="52" text-anchor="middle" class="svg-ink" font-size="13">decide</text><text x="277" y="68" text-anchor="middle" class="svg-muted" font-size="10">khaali? --apply?</text>
<rect x="341" y="30" width="96" height="50" rx="8" fill="#bbf7d0"/><text x="389" y="52" text-anchor="middle" class="svg-ink" font-size="13">commit</text><text x="389" y="68" text-anchor="middle" class="svg-muted" font-size="10">Junos par revert_in</text>
<rect x="453" y="30" width="86" height="50" rx="8" fill="#e2e8f0"/><text x="496" y="52" text-anchor="middle" class="svg-ink" font-size="13">verify</text><text x="496" y="68" text-anchor="middle" class="svg-muted" font-size="10">get_ntp_servers</text>
<rect x="555" y="30" width="80" height="50" rx="8" fill="#bbf7d0"/><text x="595" y="52" text-anchor="middle" class="svg-ink" font-size="13">confirm</text><text x="595" y="68" text-anchor="middle" class="svg-muted" font-size="10">exit 0</text>
<line x1="101" y1="55" x2="117" y2="55" stroke="#64748b" stroke-width="2"/><line x1="213" y1="55" x2="229" y2="55" stroke="#64748b" stroke-width="2"/><line x1="325" y1="55" x2="341" y2="55" stroke="#64748b" stroke-width="2"/><line x1="437" y1="55" x2="453" y2="55" stroke="#64748b" stroke-width="2"/><line x1="539" y1="55" x2="555" y2="55" stroke="#64748b" stroke-width="2"/>
<rect x="229" y="105" width="96" height="40" rx="8" fill="#e2e8f0"/><text x="277" y="122" text-anchor="middle" class="svg-ink" font-size="13">discard</text><text x="277" y="138" text-anchor="middle" class="svg-muted" font-size="10">karne ko kuch nahi</text><line x1="277" y1="80" x2="277" y2="105" stroke="#64748b" stroke-width="2"/>
<rect x="453" y="105" width="182" height="40" rx="8" fill="#fecaca"/><text x="544" y="130" text-anchor="middle" class="svg-ink" font-size="13">verify fail: rollback(), exit 1</text><line x1="496" y1="80" x2="496" y2="105" stroke="#dc2626" stroke-width="2"/>
</svg><p class="cap">Paanch checkpoints. Inme se do change ko commit se pehle ya baad rok sakte hain.</p></div>

<h3>Code</h3>
<p><code>ntpsync.py</code> ka doosra hissa (pehla hissa chapter 5 mein hai). Lab mein ise <code>cat &gt;&gt;</code> se jodte ho.</p>
<pre class="code">

def sync(name, servers, apply=False):
    """Diff first. Commit only when there is a diff and --apply was given. True when the device is right."""
    driver = DEVICES[name]["driver"]
    dev = open_device(name)
    try:
        try:
            dev.load_merge_candidate(config=candidate(driver, servers))
        except MergeConfigException as err:
            print("%s: the device refused the candidate: %s" % (name, err))
            return False
        diff = dev.compare_config()
        if not diff.strip():
            print("%s: already compliant, nothing to commit" % name)
            dev.discard_config()
            return True
        print("%s: diff before commit" % name)
        print(diff)
        if not apply:
            dev.discard_config()
            print("%s: dry run, candidate discarded" % name)
            return True
        if driver == "junos":
            dev.commit_config(revert_in=120, message="ntpsync")
        else:
            dev.commit_config()
        have = dev.get_ntp_servers()
        missing = [s for s in servers if s not in have]
        if missing:
            print("%s: VERIFY FAILED, missing %s - rolling back" % (name, missing))
            dev.rollback()
            return False
        if driver == "junos":
            dev.confirm_commit()
        print("%s: committed and verified: %s" % (name, sorted(have)))
        return True
    finally:
        dev.close()


if __name__ == "__main__":
    apply = "--apply" in sys.argv
    names = [a for a in sys.argv[1:] if not a.startswith("--")]
    results = [sync(n, WANT, apply) for n in names]
    sys.exit(0 if all(results) else 1)</pre>
<ul>
<li><b>MergeConfigException</b> pakdi jaati hai aur report hoti hai; function <code>False</code> lautata hai aur exit code wahi batata hai.</li>
<li><b>Khaali diff</b> ka matlab "pehle se compliant": candidate discard hota hai aur kuch commit nahi hota. Yahi tool ko <i>idempotent</i> banata hai.</li>
<li><b><code>--apply</code> ke bina</b> tool dry run hai: diff print karta hai aur discard karta hai.</li>
<li><b>Junos</b> <code>revert_in=120</code> aur ek <code>message</code> ke saath commit hota hai, isliye script mar jaye to router khud rollback kar leta hai. Chapter 8 yeh cover karta hai. IOS aur EOS ko seedha <code>commit_config()</code> milta hai, kyunki lab drivers un arguments par <code>NotImplementedError</code> uthate hain.</li>
<li><b>Verify</b> getter se hota hai, commit ki khamoshi se nahi. Server missing ho to tool <code>rollback()</code> bulata hai.</li>
<li><b>Exit code</b>: <code>sys.exit(0)</code> tabhi jab har device sahi ho.</li></ul>

<h3>Chalao: dry run, apply, phir se</h3>
<pre class="out">AUTO01$ python3 ntpsync.py R1 J1
R1: diff before commit
+ntp server 10.99.0.61
R1: dry run, candidate discarded
J1: diff before commit
[edit system ntp]
+   server 10.99.0.61;
J1: dry run, candidate discarded</pre>
<p>Dry run dono diff print karta hai aur "candidate discarded". Devices par kuch nahi badla. Ab asli run:</p>
<pre class="out">AUTO01$ python3 ntpsync.py R1 J1 --apply
R1: diff before commit
+ntp server 10.99.0.61
<span class="hl">R1: committed and verified: ['10.99.0.60', '10.99.0.61']</span>
J1: diff before commit
[edit system ntp]
+   server 10.99.0.61;
<span class="hl">J1: committed and verified: ['10.99.0.60', '10.99.0.61']</span></pre>
<p>Har device ko ek line mili, aur getter ne use wapas padha. Junos par commit log dikhata hai tool ne kya kiya:</p>
<pre class="out">J1&gt; show system commit
0   2026-10-11 15:01:24 UTC by netops via netconf
1   2026-10-11 15:01:24 UTC by netops via netconf <span class="hl">commit confirmed, rollback in 2mins</span>
    ntpsync
2   2026-10-11 15:00:07 UTC by root via other</pre>
<p>Entry 1 message <code>ntpsync</code> ke saath confirmed commit hai; entry 0 woh confirming commit hai jo <code>confirm_commit()</code> ne bheja. Uske baad ka run idempotence saabit karta hai:</p>
<pre class="out">AUTO01$ python3 ntpsync.py R1 J1 --apply; echo "exit code: $?"
R1: already compliant, nothing to commit
J1: already compliant, nothing to commit
<span class="hl">exit code: 0</span></pre>
<p>Dono par "already compliant, nothing to commit", aur exit code <code>0</code>. Ise har ghante cron se chalao to jab tak kuch drift na ho kuch nahi badalta, aur drift hone par theek wahi theek karta hai.</p>

<div class="note"><p><b>Lab mein vs asli gear par.</b> Lab IOS mein commit message aur confirm nahi hai, isliye asli IOS XE tool ko alag safety net bhi chahiye: change se pehle backup (<code>get_config</code>) ya driver ka apna rollback. Lab Junos <code>revert_in</code> ko poore minutes tak round up karta hai, isliye 120 seconds 2mins dikhte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Usi object se verify karna jisne commit kiya, jisse toota hua management path kabhi pata nahi chalta (asli health check ke liye naya session kholo, jaise <code>adv-netconf</code> ne kiya); <code>Exception</code> pakadkar aage badh jana; diff khaali ho tab bhi commit karna; device fail ho tab bhi exit 0 dena.</p></div>

<div class="exam"><p><b>Exam trap.</b> Idempotent ka matlab "kabhi commit nahi karta" nahi hai. Matlab: wahi input ke saath doosra run khaali diff paata hai aur kuch nahi badalta.</p></div>

<div class="scn"><h4>Ek extra server, 40 routers, koi outage nahi</h4><p>Security team ne audit se pehle har router par doosra NTP server maanga. Engineer ne pehle <code>--apply</code> ke bina tool chalaya aur 40 diffs change ticket mein paste kar diye. Reviewers ko har ek mein ek joda hua line dikha, sirf ek router ko chhodkar jiske diff mein ek unexpected parent line thi: uske template mein typo. Unhone us ek device ko haath se theek kiya, <code>--apply</code> se chalaya, aur doosre run ne 40 baar "already compliant" print kiya.</p><p><b>Lesson:</b> dry run, review, apply, phir se chalao. Doosra run aapka saboot hai.</p></div>

<div class="iv"><p class="q">"Configuration script ko idempotent kaise banaoge?"</p><p>Likhne se pehle desired aur actual ka difference nikalta hoon. compare_config khaali ho to kuch nahi karta aur exit 0 deta hoon. Nahi to commit karta hoon, getter se verify karta hoon, aur doosre run ko "nothing to commit" print karna chahiye. Diff hi idempotence ka test hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order: load, diff, decide, commit, verify, confirm ya roll back.</li>
<li>Khaali diff ka matlab kuch mat karo; yahi idempotence hai.</li>
<li>Dry run default hai; <code>--apply</code> saaf shabdon mein.</li>
<li>Getter se verify karo aur fail par roll back karo.</li>
<li>Koi device galat ho to non-zero exit code do.</li></ul></div>`}};export{e as default};