var e={id:`reading-output`,h:{en:`Reading Ansible output: ok, changed, failed and the recap`,hi:`Ansible output padhna: ok, changed, failed aur recap`},body:{en:`
<p>A playbook run prints a lot of text. Beginners scroll past it and look for green. A good engineer <b>reads</b> it, because the output says exactly what happened on every device. This chapter shows how to read it in a minute.</p>

<h3>Analogy: a site-visit report</h3>
<p>Imagine a supervisor visiting two branch offices with a checklist. For every item and every branch she writes one word: already fine, fixed it, or could not do it. The Ansible output is that report. The last page, the <b>PLAY RECAP</b>, is the summary table.</p>

<h3>One run, line by line</h3>
<pre class="out">PLAY [Baseline banner and NTP] ************************

TASK [Set the login banner] ****************************
changed: [pun-core-r1]
fatal: [blr-edge-r2]: FAILED! =&gt; {"changed": false, "msg": "ssh connection failed: Authentication failed for user netops"}

TASK [Set the NTP server] ******************************
changed: [pun-core-r1]

PLAY RECAP *********************************************
pun-core-r1   : ok=2  changed=2  unreachable=0  failed=0  skipped=0
blr-edge-r2   : ok=0  changed=0  unreachable=0  failed=1  skipped=0</pre>
<ul>
<li><b>PLAY</b> is the name of the play. <b>TASK</b> is one step. Under each task you get <b>one line per device</b>, with the device name in square brackets.</li>
<li><b>ok</b>: the device already matched what you asked, nothing was changed.</li>
<li><b>changed</b>: Ansible changed the device to match your request.</li>
<li><b>skipping</b>: a <code>when:</code> condition was false, so the task did not run on that device.</li>
<li><b>fatal ... FAILED</b>: the task ran and failed. The text after <code>msg</code> is the reason, so read it.</li>
<li><b>UNREACHABLE</b>: Ansible could not even log in or connect (wrong address, SSH blocked). Different from FAILED, and the fix is on the network or login side.</li>
</ul>
<p>Notice the second task: <code>blr-edge-r2</code> does not appear in it at all. Once a device fails, Ansible stops running tasks on that device and carries on with the others.</p>

<h3>The recap is the truth</h3>
<table class="cmp">
<tr><th>Column</th><th>Meaning</th></tr>
<tr><td><code>ok</code></td><td>tasks that succeeded (includes the changed ones)</td></tr>
<tr><td><code>changed</code></td><td>tasks that actually changed something</td></tr>
<tr><td><code>unreachable</code></td><td>devices Ansible could not connect to</td></tr>
<tr><td><code>failed</code></td><td>tasks that failed</td></tr>
<tr><td><code>skipped</code></td><td>tasks skipped by a condition</td></tr>
</table>
<p>Look at the recap first. <code>failed=0 unreachable=0</code> on every row is a clean run. Then run the same playbook again: a healthy, well-written playbook shows <code>changed=0</code>. That is idempotency, and it is also your proof that the first run really finished the job.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="How to read a run">
<rect x="15" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Recap first</text>
<rect x="175" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="245" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. Find fatal line</text>
<rect x="335" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="405" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. Read the msg</text>
<rect x="495" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4. Fix and rerun</text>
<path class="svg-muted" d="M155 42h20M315 42h20M475 42h20" stroke="currentColor" fill="none"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Re-run only the failed device with --limit; success is changed=0 on the second run.</text>
</svg><p class="cap">A one-minute routine for every run.</p></div>

<h3>Three flags that make runs safer</h3>
<pre class="code">$ ansible-playbook ntp.yml --list-hosts      # who would be touched? nothing runs
$ ansible-playbook ntp.yml --check           # dry run: what WOULD change
$ ansible-playbook ntp.yml --limit blr-edge-r2   # run for one device or group only</pre>
<p>Use <code>--list-hosts</code> before a big change to confirm the target list, <code>--check</code> to preview, and <code>--limit</code> to repair or test on one device first.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Reading only the colours. (2) Ignoring a device that is missing from later tasks: it failed earlier. (3) Treating UNREACHABLE and FAILED as the same thing. (4) Re-running everything after one device failed, instead of fixing the cause and using <code>--limit</code>.</p></div>
<div class="exam"><p><b>Interview trap.</b> "The run finished with no red text, so is the change done?" Not necessarily. Check the recap for <code>unreachable</code> and <code>failed</code>, and confirm on the device or with a second run that shows <code>changed=0</code>.</p></div>

<div class="scn"><h4>The router that quietly missed the change</h4><p>An engineer pushed a new NTP server to 40 routers and saw lots of green. One router had an old password and was marked UNREACHABLE near the top of the output, long before the recap. Two days later that router drifted by 6 minutes and logs stopped matching. The recap showed <code>unreachable=1</code> all along.</p><p><b>Lesson:</b> the recap takes ten seconds to read and would have caught it.</p></div>

<div class="iv"><p class="q">"What does changed=0 on the second run tell you?"</p><p>That the playbook is idempotent and the devices already match the desired state. Add that you also use <code>--check</code> for a preview and <code>--limit</code> to roll out to one device first.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>One line per device per task: ok, changed, skipping, fatal.</li>
<li>FAILED means the task failed; UNREACHABLE means Ansible could not connect.</li>
<li>The PLAY RECAP is the summary: look for failed=0 and unreachable=0.</li>
<li>A second run should show changed=0.</li>
<li>--list-hosts, --check and --limit make runs safe and precise.</li>
</ul></div>
`,hi:`
<p>Playbook run bahut saara text print karta hai. Beginners use scroll karke bas green dhoondhte hain. Achha engineer use <b>padhta</b> hai, kyunki output batata hai ki har device par bilkul kya hua. Yeh chapter ek minute mein ise padhna sikhata hai.</p>

<h3>Analogy: site-visit report</h3>
<p>Socho ek supervisor checklist leke do branch offices visit karti hai. Har item aur har branch ke liye woh ek shabd likhti hai: pehle se theek, theek kar diya, ya nahi ho paya. Ansible ka output wahi report hai. Aakhri page, <b>PLAY RECAP</b>, summary table hai.</p>

<h3>Ek run, line by line</h3>
<pre class="out">PLAY [Baseline banner and NTP] ************************

TASK [Set the login banner] ****************************
changed: [pun-core-r1]
fatal: [blr-edge-r2]: FAILED! =&gt; {"changed": false, "msg": "ssh connection failed: Authentication failed for user netops"}

TASK [Set the NTP server] ******************************
changed: [pun-core-r1]

PLAY RECAP *********************************************
pun-core-r1   : ok=2  changed=2  unreachable=0  failed=0  skipped=0
blr-edge-r2   : ok=0  changed=0  unreachable=0  failed=1  skipped=0</pre>
<ul>
<li><b>PLAY</b> play ka naam hai. <b>TASK</b> ek step hai. Har task ke neeche <b>har device ki ek line</b> aati hai, device ka naam square brackets mein.</li>
<li><b>ok</b>: device pehle se wahi tha jo aapne manga, kuch nahi badla.</li>
<li><b>changed</b>: Ansible ne device ko aapki request ke hisaab se badla.</li>
<li><b>skipping</b>: <code>when:</code> condition false thi, isliye us device par task nahi chala.</li>
<li><b>fatal ... FAILED</b>: task chala aur fail hua. <code>msg</code> ke baad ka text wajah hai, use padho.</li>
<li><b>UNREACHABLE</b>: Ansible login ya connect hi nahi kar paya (galat address, SSH blocked). FAILED se alag hai, aur fix network ya login side par hota hai.</li>
</ul>
<p>Doosra task dekho: <code>blr-edge-r2</code> usme dikhta hi nahi. Jaise hi koi device fail hota hai, Ansible us device par tasks rok deta hai aur baaki devices ke saath aage badhta hai.</p>

<h3>Recap hi sach hai</h3>
<table class="cmp">
<tr><th>Column</th><th>Matlab</th></tr>
<tr><td><code>ok</code></td><td>jo tasks succeed hue (changed wale bhi isme)</td></tr>
<tr><td><code>changed</code></td><td>jin tasks ne sach mein kuch badla</td></tr>
<tr><td><code>unreachable</code></td><td>jin devices se Ansible connect nahi ho paya</td></tr>
<tr><td><code>failed</code></td><td>jo tasks fail hue</td></tr>
<tr><td><code>skipped</code></td><td>condition ki wajah se skip hue tasks</td></tr>
</table>
<p>Pehle recap dekho. Har row par <code>failed=0 unreachable=0</code> matlab clean run. Phir wahi playbook dobara chalao: achha, sahi likha playbook <code>changed=0</code> dikhata hai. Yeh idempotency hai, aur yahi saboot bhi hai ki pehli run ne kaam sach mein poora kiya.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Run kaise padhein">
<rect x="15" y="20" width="140" height="44" rx="8" fill="#e2e8f0"/><text x="85" y="47" text-anchor="middle" class="svg-ink" font-size="13">1. Pehle recap</text>
<rect x="175" y="20" width="140" height="44" rx="8" fill="#bae6fd"/><text x="245" y="47" text-anchor="middle" class="svg-ink" font-size="13">2. fatal line dhoondho</text>
<rect x="335" y="20" width="140" height="44" rx="8" fill="#fde68a"/><text x="405" y="47" text-anchor="middle" class="svg-ink" font-size="13">3. msg padho</text>
<rect x="495" y="20" width="130" height="44" rx="8" fill="#bbf7d0"/><text x="560" y="47" text-anchor="middle" class="svg-ink" font-size="13">4. Fix, rerun</text>
<path class="svg-muted" d="M155 42h20M315 42h20M475 42h20" stroke="currentColor" fill="none"/>
<text x="320" y="110" text-anchor="middle" class="svg-muted" font-size="12">Sirf fail hue device ko --limit se dobara chalao; doosri run mein changed=0 matlab success.</text>
</svg><p class="cap">Har run ke liye ek minute ka routine.</p></div>

<h3>Teen flags jo runs ko safe banate hain</h3>
<pre class="code">$ ansible-playbook ntp.yml --list-hosts      # who would be touched? nothing runs
$ ansible-playbook ntp.yml --check           # dry run: what WOULD change
$ ansible-playbook ntp.yml --limit blr-edge-r2   # run for one device or group only</pre>
<p>Bade change se pehle target list confirm karne ke liye <code>--list-hosts</code>, preview ke liye <code>--check</code>, aur pehle ek device par repair ya test karne ke liye <code>--limit</code> use karo.</p>

<div class="warn"><p><b>Common mistakes.</b> (1) Sirf colours padhna. (2) Aise device ko ignore karna jo baad ke tasks se gayab hai: woh pehle hi fail ho chuka. (3) UNREACHABLE aur FAILED ko ek hi samajhna. (4) Ek device fail hone par wajah theek karne aur <code>--limit</code> use karne ki jagah sab kuch dobara chalana.</p></div>
<div class="exam"><p><b>Interview trap.</b> "Run bina red text ke khatam hua, to kya change ho gaya?" Zaroori nahi. Recap mein <code>unreachable</code> aur <code>failed</code> dekho, aur device par ya doosri run se confirm karo jo <code>changed=0</code> dikhaye.</p></div>

<div class="scn"><h4>Woh router jisne change chupchaap miss kiya</h4><p>Ek engineer ne 40 routers par naya NTP server push kiya aur bahut saara green dekha. Ek router ka password purana tha aur output ke upar hi UNREACHABLE likha tha, recap se kaafi pehle. Do din baad woh router 6 minute drift ho gaya aur logs match hona band ho gaye. Recap shuru se <code>unreachable=1</code> dikha raha tha.</p><p><b>Lesson:</b> recap padhne mein das second lagte hain aur yeh pakad leta.</p></div>

<div class="iv"><p class="q">"Doosri run par changed=0 kya batata hai?"</p><p>Yeh ki playbook idempotent hai aur devices pehle se desired state mein hain. Jodo ki preview ke liye <code>--check</code> aur pehle ek device par rollout ke liye <code>--limit</code> bhi use karte ho.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Har task mein har device ki ek line: ok, changed, skipping, fatal.</li>
<li>FAILED matlab task fail hua; UNREACHABLE matlab Ansible connect nahi kar paya.</li>
<li>PLAY RECAP summary hai: failed=0 aur unreachable=0 dekho.</li>
<li>Doosri run mein changed=0 hona chahiye.</li>
<li>--list-hosts, --check aur --limit runs ko safe aur precise banate hain.</li>
</ul></div>
`}};export{e as default};