var e=`<pre class="code"><span class="c"># the whole module on one screen</span>
from jnpr.junos.utils.config import Config
from jnpr.junos.exception import LockError, ConfigLoadError, CommitError

cu = Config(dev)                       <span class="c"># or Config(dev, mode="private"), or dev.bind(cu=Config)</span>
cu.lock()                              <span class="c"># LockError: held, or "configuration database modified"</span>
try:
    cu.load(text, format="set", merge=True)         <span class="c"># set / text / xml / json, or path="file"</span>
    cu.load(template_path="t.j2", template_vars={}) <span class="c"># render on the PyEZ side</span>
    diff = cu.diff()                   <span class="c"># None = nothing to do</span>
    cu.commit_check()                  <span class="c"># CommitError if inconsistent</span>
    cu.commit(confirm=2, comment="TICKET-123")      <span class="c"># 2 MINUTES, auto rollback</span>
    ...                                <span class="c"># settle, health gate from the device</span>
    cu.commit(comment="TICKET-123 confirmed")        <span class="c"># plain commit = confirm</span>
except (ConfigLoadError, CommitError):
    cu.rollback()                      <span class="c"># rollback(0): discard the candidate</span>
finally:
    cu.unlock()
    dev.close()</pre>`,t={id:`summary`,h:{en:`Summary and cheat-sheet`,hi:`Summary aur cheat-sheet`},body:{en:`
<p>You started this module with a function that could push a change. You end it with a procedure that cannot easily hurt you. The shape is always the same: <b>take the candidate, prove what will change, let the router judge, commit with a timer, let the network prove it works, and only then keep it</b>.</p>

<h3>The checklist</h3>
<ol class="steps">
<li>Connect with <code>Device()</code> (<code>adv-pyez</code>) and build <code>Config(dev)</code>.</li>
<li><code>lock()</code>. Handle <code>LockError</code> as "not now", exit 2.</li>
<li>Render the intent with Jinja2 using <code>StrictUndefined</code> (<code>py-templates</code>), so a missing variable is an error, not an empty string.</li>
<li>Choose the action on purpose: merge to add, replace for "exactly", override only with a complete file.</li>
<li><code>load()</code>, then <code>diff()</code>. If it is <code>None</code>, stop: nothing to do.</li>
<li>Read the diff. Anything you cannot explain is a stop.</li>
<li><code>commit_check()</code>. Handle <code>CommitError</code>.</li>
<li><code>commit(confirm=N, comment=...)</code> with N in minutes and the ticket in the comment.</li>
<li>Wait for the network to react, then run the health gate from a fresh view.</li>
<li>Good: plain <code>commit()</code>. Bad: <code>rollback(1)</code> and <code>commit()</code>, or let the timer expire.</li>
<li><code>unlock()</code> and <code>close()</code> in <code>finally</code>, and return an exit code.</li>
<li>Verify the result from the devices, not from the script's own output.</li></ol>

<h3>The cheat-sheet</h3>
`+e+`
<h3>Glossary</h3>
<dl class="terms">
<dt>candidate</dt><dd>The editable copy of the configuration. Shared by default; a commit publishes all of it.</dd>
<dt>running</dt><dd>The configuration the router is using now.</dd>
<dt>lock</dt><dd>Exclusive hold on the candidate. Fails if held or if the candidate is already dirty.</dd>
<dt>merge / replace / override</dt><dd>Add only / converge the tagged stanza / become exactly the file.</dd>
<dt>commit confirmed</dt><dd>A commit that reverts by itself unless confirmed within N minutes (PyEZ).</dd>
<dt>health gate</dt><dd>A check after the change that decides to confirm or roll back.</dd>
<dt>rollback(n)</dt><dd>Load rollback file n into the candidate. You still have to commit.</dd>
<dt>idempotent</dt><dd>Running it again changes nothing and says so.</dd></dl>

<h3>The facts that are tested most</h3>
<table class="cmp"><tr><th>Fact</th><th>Answer</th></tr>
<tr><td>Unit of <code>commit(confirm=)</code> in PyEZ</td><td>Minutes (ncclient: seconds)</td></tr>
<tr><td>What does <code>diff()</code> return when nothing differs?</td><td><code>None</code></td></tr>
<tr><td>Default load action for text/xml/json</td><td>Replace (tags matter), not merge</td></tr>
<tr><td>How do you remove a line in set format?</td><td>A <code>delete</code> statement</td></tr>
<tr><td>What does <code>rollback(1)</code> do alone?</td><td>Loads into the candidate; needs <code>commit()</code></td></tr>
<tr><td>"configuration database modified" means</td><td>Dirty candidate, not a live holder</td></tr>
<tr><td>Does <code>with Config(dev)</code> roll back on exit?</td><td>No</td></tr>
<tr><td>Exception from a bad load / bad check</td><td><code>ConfigLoadError</code> / <code>CommitError</code></td></tr>
<tr><td><code>all()</code> of an empty list</td><td><code>True</code>: check for at least one peer</td></tr>
<tr><td>How do you confirm?</td><td>A plain <code>commit()</code> before the timer ends</td></tr></table>

<h3>Where this connects</h3>
<ul>
<li><code>adv-pyez</code>: the Device object, facts, RPCs and exceptions this module builds on.</li>
<li><code>adv-netconf</code>: the same locks and confirmed commits at the protocol level, in seconds.</li>
<li><code>py-templates</code> and <code>py-safepush</code>: Jinja2 rendering and the dry-run, diff, verify, roll back habit for text devices.</li>
<li>Next in the track: validating configuration before it ever reaches a device.</li></ul>

<div class="note"><p><b>What differs from real PyEZ.</b> This lab models the parts taught here. It does not model rescue configuration, private-mode <code>open()</code>, every protocol fault (a wrong peer AS or a changed key does not break its sessions) or every commit-time check. A <code>replace:</code> tag also acts under <code>merge=True</code> in the lab; on real gear, pair the tag with the default action as shown. <code>overwrite=True</code> with set format is not meaningful. Treat the lab as a place to learn the sequence and the vocabulary, and the router's own documentation as the final word on edge cases.</p></div>

<div class="exam"><p><b>Exam trap.</b> Questions often mix PyEZ and ncclient: <code>confirm</code> units, whether a method exists called "confirm", and whether <code>rollback()</code> commits. The safe answers: minutes, no, and no.</p></div>

<div class="scn"><h4>The change window, start to finish</h4><p>Ticket: add a customer uplink on three routers, tonight. You render per device, dry-run all three and read the diffs, push J1 alone with a two-minute timer, watch the gate print "2 BGP peers Established", confirm, run the tool again to see "nothing to change", then push J2 and J3. Next morning a verify script compares all three with the intent and attaches the output to the ticket.</p><p><b>Lesson:</b> nothing in that story was clever. It was a short list, done in order, with proof at each step.</p></div>

<div class="iv"><p class="q">"Summarise how you make a Junos config change safe with PyEZ."</p><p>I lock the candidate, load a rendered change with an explicit merge or replace, and read the diff, stopping if it is None or unexpected. I run commit_check, then commit with a confirm timer in minutes and the ticket in the comment. After a settle delay a health gate checks the service at risk, such as BGP sessions, and I either send a confirming commit or roll back. I always unlock in finally, return an exit code, and verify the result from the devices afterwards.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lock, load, diff, check, commit confirmed, gate, confirm or roll back, unlock.</li>
<li>Choose merge, replace or override deliberately; "exactly" means replace.</li>
<li>Confirm is minutes in PyEZ and is just a plain commit.</li>
<li>A gate must fail on "no data", not only on "bad data".</li>
<li>Prove the outcome by reading the devices back.</li></ul></div>
`,hi:`
<p>Aapne yeh module aise function se shuru kiya jo change push kar sakta tha. Aap ise aisi procedure ke saath khatam kar rahe ho jo aapko aasani se nuksaan nahi pahuncha sakti. Shape hamesha wahi hai: <b>candidate lo, saabit karo ki kya badlega, router ko faisla karne do, timer ke saath commit karo, network ko saabit karne do ki kaam karta hai, aur tabhi use rakho</b>.</p>

<h3>Checklist</h3>
<ol class="steps">
<li><code>Device()</code> (<code>adv-pyez</code>) se connect karo aur <code>Config(dev)</code> banao.</li>
<li><code>lock()</code>. <code>LockError</code> ko "abhi nahi" maano, exit 2.</li>
<li>Intent ko Jinja2 se <code>StrictUndefined</code> ke saath render karo (<code>py-templates</code>), taaki missing variable error ho, empty string nahi.</li>
<li>Action jaan-boojh kar chuno: jodne ke liye merge, "exactly" ke liye replace, override sirf complete file ke saath.</li>
<li><code>load()</code>, phir <code>diff()</code>. <code>None</code> ho to ruko: karne ko kuch nahi.</li>
<li>Diff padho. Jo samjha nahi sakte woh stop hai.</li>
<li><code>commit_check()</code>. <code>CommitError</code> handle karo.</li>
<li><code>commit(confirm=N, comment=...)</code>, N minutes mein aur comment mein ticket.</li>
<li>Network ke react karne tak ruko, phir fresh view se health gate chalao.</li>
<li>Achha: plain <code>commit()</code>. Bura: <code>rollback(1)</code> aur <code>commit()</code>, ya timer expire hone do.</li>
<li><code>finally</code> mein <code>unlock()</code> aur <code>close()</code>, aur exit code lautao.</li>
<li>Result devices se verify karo, script ke apne output se nahi.</li></ol>

<h3>Cheat-sheet</h3>
`+e+`
<h3>Glossary</h3>
<dl class="terms">
<dt>candidate</dt><dd>Configuration ki editable copy. Default mein shared; commit uska sab kuch publish karta hai.</dd>
<dt>running</dt><dd>Jo configuration router abhi use kar raha hai.</dd>
<dt>lock</dt><dd>Candidate par exclusive hold. Fail hota hai agar kisi ke paas ho ya candidate pehle se dirty ho.</dd>
<dt>merge / replace / override</dt><dd>Sirf jodo / tagged stanza ko converge karo / bilkul file jaisa ban jao.</dd>
<dt>commit confirmed</dt><dd>Aisa commit jo khud revert ho jaata hai jab tak N minutes ke andar confirm na ho (PyEZ).</dd>
<dt>health gate</dt><dd>Change ke baad ka check jo confirm ya rollback tay karta hai.</dd>
<dt>rollback(n)</dt><dd>Rollback file n ko candidate mein load karo. Commit aapko phir bhi karna hai.</dd>
<dt>idempotent</dt><dd>Dobara chalane par kuch nahi badalta aur batata hai.</dd></dl>

<h3>Sabse zyaada pooche jaane wale facts</h3>
<table class="cmp"><tr><th>Fact</th><th>Jawab</th></tr>
<tr><td>PyEZ mein <code>commit(confirm=)</code> ki unit</td><td>Minutes (ncclient: seconds)</td></tr>
<tr><td>Kuch alag na ho to <code>diff()</code> kya lautata hai?</td><td><code>None</code></td></tr>
<tr><td>Text/xml/json ke liye default load action</td><td>Replace (tags matter karte hain), merge nahi</td></tr>
<tr><td>Set format mein line kaise hatate hain?</td><td><code>delete</code> statement</td></tr>
<tr><td><code>rollback(1)</code> akela kya karta hai?</td><td>Candidate mein load karta hai; <code>commit()</code> chahiye</td></tr>
<tr><td>"configuration database modified" ka matlab</td><td>Dirty candidate, live holder nahi</td></tr>
<tr><td>Kya <code>with Config(dev)</code> exit par rollback karta hai?</td><td>Nahi</td></tr>
<tr><td>Bad load / bad check ka exception</td><td><code>ConfigLoadError</code> / <code>CommitError</code></td></tr>
<tr><td>Empty list ka <code>all()</code></td><td><code>True</code>: kam se kam ek peer check karo</td></tr>
<tr><td>Confirm kaise karte hain?</td><td>Timer khatam hone se pehle plain <code>commit()</code></td></tr></table>

<h3>Yeh kahan jodta hai</h3>
<ul>
<li><code>adv-pyez</code>: Device object, facts, RPCs aur exceptions jin par yeh module bana hai.</li>
<li><code>adv-netconf</code>: wahi locks aur confirmed commits protocol level par, seconds mein.</li>
<li><code>py-templates</code> aur <code>py-safepush</code>: Jinja2 rendering aur text devices ke liye dry-run, diff, verify, roll back ki aadat.</li>
<li>Track mein agla: configuration ko device tak pahunchne se pehle validate karna.</li></ul>

<div class="note"><p><b>Real PyEZ se kya alag hai.</b> Yeh lab wahi hisse model karta hai jo yahan sikhaye gaye. Yeh rescue configuration, private-mode <code>open()</code>, har protocol fault (galat peer AS ya badli key iske sessions nahi todti) ya har commit-time check model nahi karta. Lab mein <code>replace:</code> tag <code>merge=True</code> ke andar bhi kaam karta hai; real gear par tag ko default action ke saath jodo jaisa dikhaya. Set format ke saath <code>overwrite=True</code> meaningful nahi hai. Lab ko sequence aur vocabulary seekhne ki jagah maano, aur edge cases par router ke apne documentation ko aakhri shabd.</p></div>

<div class="exam"><p><b>Exam trap.</b> Sawaal aksar PyEZ aur ncclient milate hain: <code>confirm</code> ki units, kya "confirm" naam ka method hai, aur kya <code>rollback()</code> commit karta hai. Safe jawab: minutes, nahi, aur nahi.</p></div>

<div class="scn"><h4>Change window, shuru se aakhir tak</h4><p>Ticket: aaj raat teen routers par customer uplink jodo. Aap per device render karte ho, teeno ka dry-run karke diffs padhte ho, J1 ko akele do minute ke timer ke saath push karte ho, gate ko "2 BGP peers Established" print karte dekhte ho, confirm karte ho, tool ko dobara chalate ho "nothing to change" dekhne ke liye, phir J2 aur J3 push karte ho. Agli subah verify script teeno ko intent se compare karti hai aur output ticket mein lagati hai.</p><p><b>Lesson:</b> us kahani mein kuch bhi chalaak nahi tha. Ek chhoti list thi, kram se ki gayi, har step par saboot ke saath.</p></div>

<div class="iv"><p class="q">"Batao ki PyEZ se Junos config change ko safe kaise banate ho."</p><p>Main candidate lock karta hoon, rendered change ko explicit merge ya replace ke saath load karta hoon, aur diff padhta hoon, None ya unexpected ho to ruk jaata hoon. Main commit_check chalata hoon, phir minutes mein confirm timer aur comment mein ticket ke saath commit karta hoon. Settle delay ke baad health gate us service ko check karta hai jo risk mein hai, jaise BGP sessions, aur main ya confirming commit bhejta hoon ya rollback karta hoon. Main hamesha finally mein unlock karta hoon, exit code lautata hoon, aur baad mein devices se result verify karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Lock, load, diff, check, commit confirmed, gate, confirm ya rollback, unlock.</li>
<li>Merge, replace ya override soch-samajh kar chuno; "exactly" ka matlab replace.</li>
<li>PyEZ mein confirm minutes hai aur bas ek plain commit hai.</li>
<li>Gate ko "no data" par bhi fail hona chahiye, sirf "bad data" par nahi.</li>
<li>Outcome devices wapas padh kar saabit karo.</li></ul></div>
`}};export{t as default};