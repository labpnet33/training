var e={id:`review-and-push`,h:{en:`Review before you push: diff, send_config_set and verify`,hi:`Push se pehle review: diff, send_config_set aur verify`},body:{en:`
<p><b>The idea of this chapter:</b> rendering is harmless; pushing changes a live device. A safe pipeline has three separate steps: render, review, push, and then a fourth: verify. You will read the lab's <code>push.py</code>, push two switches and check the result on the device.</p>

<h3>Analogy: proof-reading before printing a thousand copies</h3>
<p>You never print a thousand brochures without proof-reading one. Rendering is the proof. Pushing is the print run. If the proof has a typo, you fix the template and proof again; you do not discover the typo after the pallets arrive.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Four step pipeline render review push verify">
<rect x="10" y="35" width="130" height="64" rx="10" fill="#bae6fd"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">1 Render</text><text x="75" y="82" text-anchor="middle" class="svg-muted" font-size="11">files only</text>
<rect x="170" y="35" width="130" height="64" rx="10" fill="#fde68a"/><text x="235" y="62" text-anchor="middle" class="svg-ink" font-size="13">2 Review</text><text x="235" y="82" text-anchor="middle" class="svg-muted" font-size="11">read, diff, count</text>
<rect x="330" y="35" width="130" height="64" rx="10" fill="#ddd6fe"/><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="13">3 Push</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="11">one device first</text>
<rect x="490" y="35" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="555" y="62" text-anchor="middle" class="svg-ink" font-size="13">4 Verify</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="11">show on the device</text>
<line x1="140" y1="67" x2="170" y2="67" stroke="#64748b" stroke-width="2"/><line x1="300" y1="67" x2="330" y2="67" stroke="#64748b" stroke-width="2"/><line x1="460" y1="67" x2="490" y2="67" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">steps 1 and 2 can be repeated safely; steps 3 and 4 touch the network</text>
</svg><p class="cap">Keep rendering and pushing as separate scripts.</p></div>

<h3>Step 2: review</h3>
<p>Review is cheap and catches most problems:</p>
<ul>
<li><b>Read one file.</b> Open one rendered config like a device owner would. Are the hostname, VLANs and ports right?</li>
<li><b>Count.</b> The render script already prints lines and ports per file. Does it match what you expect?</li>
<li><b>Diff against a reviewed copy.</b> A "golden" file is a config a senior engineer has approved. <code>diff configs/BLR-BR-R1.cfg golden/BLR-BR-R1.cfg</code> prints nothing if the files are identical. In chapter 8 you will see the real output when they differ: <code>&lt;</code> lines are yours and <code>&gt;</code> lines are the reviewed copy.</li>
</ul>

<h3>Step 3: push.py, line by line</h3>
<pre class="code">import sys
from nkmiko import ConnectHandler

if len(sys.argv) != 3:
    sys.exit("usage: python3 push.py &lt;hostname&gt; &lt;management ip&gt;")
name, ip = sys.argv[1], sys.argv[2]
with open(f"configs/{name}.cfg") as f:
    lines = [l for l in f.read().splitlines() if l.strip() not in ("", "!")]

conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
print(conn.send_config_set(lines))
conn.save_config()
conn.disconnect()
print(f"{name}: {len(lines)} lines pushed and saved")</pre>
<ul>
<li><code>sys.argv</code> holds what you typed after the script name. The script needs exactly two arguments, a hostname and a management address, and exits with a usage line otherwise.</li>
<li>The list comprehension reads the rendered file and keeps every line except empty ones and lone <code>!</code> separators, because those add nothing on a device.</li>
<li><code>ConnectHandler(...)</code> opens an SSH session. <code>nkmiko</code> is the lab's netmiko-style library; <code>nk_ios</code> is the device type.</li>
<li><code>send_config_set(lines)</code> enters configuration mode, sends every line, and leaves it. It returns the whole terminal conversation as text.</li>
<li><code>save_config()</code> copies the running configuration to startup, like <code>write memory</code>, so a reload keeps the change.</li>
</ul>
<p>Run it without arguments, then with them:</p>
<pre class="out">AUTO01$ python3 push.py
<span class="hl">usage: python3 push.py &lt;hostname&gt; &lt;management ip&gt;</span>
AUTO01$ python3 push.py PUN-ACC-SW1 10.99.0.11 | tail -n 4
PUN-ACC-SW1(config-if)#spanning-tree bpduguard enable
PUN-ACC-SW1(config-if)#end
PUN-ACC-SW1#
<span class="hl">PUN-ACC-SW1: 28 lines pushed and saved</span></pre>
<p>The rendered SW1 file has 31 lines. Three of them are lone <code>!</code> separators, so 31 - 3 = 28 lines were sent. (The full push prints every line as the switch accepts it; you also see the portfast warning that IOS gives for every portfast port. It is the normal warning, not an error.) For PUN-ACC-SW2, which has 24 lines in its file, the final line says 21 lines pushed.</p>

<h3>Step 4: verify on the device</h3>
<p>"The script finished" is not proof. Ask the switch. A small script opens a new session and reads the real running config:</p>
<pre class="out">AUTO01$ python3 verify.py
Building configuration...

Current configuration : 182 bytes
!
interface GigabitEthernet0/4
 description USER-3
 switchport access vlan 10
 switchport mode access
 switchport voice vlan 20
 spanning-tree portfast
 <span class="hl">spanning-tree bpduguard enable</span>
end
10   USERS                            active    Gi0/2, Gi0/3, Gi0/4
20   VOICE                            active
99   MGMT                             active</pre>
<p>Port Gi0/4 carries the description, the access VLAN, the voice VLAN and BPDU guard that the template produced, and the three VLANs exist. Notice that the device re-orders the commands in its own order; that is normal, and it is why you verify by <i>content</i>, not by line order.</p>

<div class="eg"><p><b>Worked example.</b> Rolling out to 40 switches: render all 40 files; read two of them; run the count check; push <b>one</b> switch and verify it; then push the next five; then the rest. If the first switch shows a problem, only one device is affected, and the fix is a template edit and a re-render.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> The lab's push script keeps the password in the code so the exercise is simple. Real scripts must not. Read credentials at run time, from the environment or a vault, for example <code>password = os.environ["NETOPS_PASSWORD"]</code> after <code>import os</code>, and prefer SSH keys. Never commit passwords to version control, and give the automation account only the privileges it needs.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Rendering and pushing in the same script, so a bad render goes straight to the network. Pushing everything at once. Not saving (<code>save_config</code>), so a reload loses the change. Trusting "finished" without a verify step. Pushing from a stale <code>configs</code> folder that was rendered from old data.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_config_set</code> works in configuration mode and adds the config; <code>send_command</code> runs a show-type command. Pushing to the <i>running</i> config does not survive a reload until you save.</p></div>

<div class="scn"><h4>The push that ran on the wrong device</h4><p>An engineer ran <code>push.py</code> with the hostname of switch 14 but the management IP of switch 41. The script has no check that the two belong together, so switch 41 received switch 14's config and lost its VLAN assignments. A later version reads both values from the same inventory row, and the push script compares the device's own hostname with the file name before sending anything.</p><p><b>Lesson:</b> take hostname and address from one source, and check the target before changing it.</p></div>

<div class="iv"><p class="q">"How do you make config automation safe?"</p><p>Separate render from push; review rendered output and diff it against a reviewed copy; push one device first (or a canary group); verify with show commands after the push; save only after verification; keep credentials out of the code; and log what was sent and to which device. Mention that a rollback plan, such as a saved previous config, is part of the change.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pipeline: render, review, push, verify. Render is repeatable; push is not.</li>
<li>Review by reading a file, counting lines and ports, and diffing against a golden copy.</li>
<li><code>send_config_set(lines)</code> sends config lines; <code>save_config()</code> saves them.</li>
<li>Verify on the device with a show command; the order of lines may differ.</li>
<li>Push one device first and never store passwords in code.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> render karna nuksaan-rahit hai; push live device badalta hai. Safe pipeline ke teen alag steps hote hain: render, review, push, aur phir chautha: verify. Aap lab ki <code>push.py</code> padhoge, do switches push karoge aur device par result check karoge.</p>

<h3>Analogy: hazaar copies chhapne se pehle proof-reading</h3>
<p>Aap hazaar brochures bina ek ka proof padhe nahi chhapte. Render proof hai. Push print run hai. Proof mein typo ho to template theek karke dobara proof dekhte ho; typo tab nahi pakadte jab pallets aa chuke ho.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Chaar step pipeline render review push verify">
<rect x="10" y="35" width="130" height="64" rx="10" fill="#bae6fd"/><text x="75" y="62" text-anchor="middle" class="svg-ink" font-size="13">1 Render</text><text x="75" y="82" text-anchor="middle" class="svg-muted" font-size="11">sirf files</text>
<rect x="170" y="35" width="130" height="64" rx="10" fill="#fde68a"/><text x="235" y="62" text-anchor="middle" class="svg-ink" font-size="13">2 Review</text><text x="235" y="82" text-anchor="middle" class="svg-muted" font-size="11">padho, diff, gino</text>
<rect x="330" y="35" width="130" height="64" rx="10" fill="#ddd6fe"/><text x="395" y="62" text-anchor="middle" class="svg-ink" font-size="13">3 Push</text><text x="395" y="82" text-anchor="middle" class="svg-muted" font-size="11">pehle ek device</text>
<rect x="490" y="35" width="130" height="64" rx="10" fill="#bbf7d0"/><text x="555" y="62" text-anchor="middle" class="svg-ink" font-size="13">4 Verify</text><text x="555" y="82" text-anchor="middle" class="svg-muted" font-size="11">device par show</text>
<line x1="140" y1="67" x2="170" y2="67" stroke="#64748b" stroke-width="2"/><line x1="300" y1="67" x2="330" y2="67" stroke="#64748b" stroke-width="2"/><line x1="460" y1="67" x2="490" y2="67" stroke="#64748b" stroke-width="2"/>
<text x="320" y="125" text-anchor="middle" class="svg-accent" font-size="12">step 1 aur 2 safely repeat ho sakte hain; step 3 aur 4 network ko chhute hain</text>
</svg><p class="cap">Rendering aur pushing ko alag scripts rakho.</p></div>

<h3>Step 2: review</h3>
<p>Review sasta hai aur zyadatar problems pakadta hai:</p>
<ul>
<li><b>Ek file padho.</b> Ek rendered config aise kholo jaise device ka owner kholega. Hostname, VLANs aur ports sahi hain?</li>
<li><b>Gino.</b> Render script pehle se har file ki lines aur ports print karti hai. Kya yeh aapki umeed se match karta hai?</li>
<li><b>Reviewed copy se diff.</b> "Golden" file woh config hai jise senior engineer ne approve kiya ho. <code>diff configs/BLR-BR-R1.cfg golden/BLR-BR-R1.cfg</code> files identical hon to kuch print nahi karta. Chapter 8 mein aap asli output dekhoge jab woh alag hon: <code>&lt;</code> lines aapki hain aur <code>&gt;</code> lines reviewed copy ki.</li>
</ul>

<h3>Step 3: push.py, line by line</h3>
<pre class="code">import sys
from nkmiko import ConnectHandler

if len(sys.argv) != 3:
    sys.exit("usage: python3 push.py &lt;hostname&gt; &lt;management ip&gt;")
name, ip = sys.argv[1], sys.argv[2]
with open(f"configs/{name}.cfg") as f:
    lines = [l for l in f.read().splitlines() if l.strip() not in ("", "!")]

conn = ConnectHandler(device_type="nk_ios", host=ip, username="netops", password="NK@2026")
print(conn.send_config_set(lines))
conn.save_config()
conn.disconnect()
print(f"{name}: {len(lines)} lines pushed and saved")</pre>
<ul>
<li><code>sys.argv</code> mein woh hai jo aapne script ke naam ke baad type kiya. Script ko theek do arguments chahiye, hostname aur management address, warna woh usage line ke saath exit hoti hai.</li>
<li>List comprehension rendered file padhta hai aur khaali lines aur akeli <code>!</code> separators ko chhodkar baaki sab rakhta hai, kyunki woh device par kuch nahi jodte.</li>
<li><code>ConnectHandler(...)</code> SSH session kholta hai. <code>nkmiko</code> lab ki netmiko jaisi library hai; <code>nk_ios</code> device type hai.</li>
<li><code>send_config_set(lines)</code> configuration mode mein jaata hai, har line bhejta hai, aur bahar aata hai. Yeh poori terminal baatcheet text ke roop mein return karta hai.</li>
<li><code>save_config()</code> running configuration ko startup mein copy karta hai, <code>write memory</code> ki tarah, taaki reload par change bacha rahe.</li>
</ul>
<p>Pehle bina arguments ke chalao, phir arguments ke saath:</p>
<pre class="out">AUTO01$ python3 push.py
<span class="hl">usage: python3 push.py &lt;hostname&gt; &lt;management ip&gt;</span>
AUTO01$ python3 push.py PUN-ACC-SW1 10.99.0.11 | tail -n 4
PUN-ACC-SW1(config-if)#spanning-tree bpduguard enable
PUN-ACC-SW1(config-if)#end
PUN-ACC-SW1#
<span class="hl">PUN-ACC-SW1: 28 lines pushed and saved</span></pre>
<p>Rendered SW1 file mein 31 lines hain. Unmein se teen akeli <code>!</code> separators hain, isliye 31 - 3 = 28 lines bheji gayi. (Poora push har line print karta hai jaise switch use accept karta hai; aapko portfast warning bhi dikhti hai jo IOS har portfast port par deta hai. Yeh normal warning hai, error nahi.) PUN-ACC-SW2 ke liye, jiski file mein 24 lines hain, aakhri line 21 lines pushed batati hai.</p>

<h3>Step 4: device par verify</h3>
<p>"Script khatam hui" saboot nahi hai. Switch se poocho. Ek chhoti script naya session kholkar asli running config padhti hai:</p>
<pre class="out">AUTO01$ python3 verify.py
Building configuration...

Current configuration : 182 bytes
!
interface GigabitEthernet0/4
 description USER-3
 switchport access vlan 10
 switchport mode access
 switchport voice vlan 20
 spanning-tree portfast
 <span class="hl">spanning-tree bpduguard enable</span>
end
10   USERS                            active    Gi0/2, Gi0/3, Gi0/4
20   VOICE                            active
99   MGMT                             active</pre>
<p>Port Gi0/4 par woh description, access VLAN, voice VLAN aur BPDU guard hai jo template ne banaya, aur teeno VLANs maujood hain. Dhyan do ki device commands ko apne order mein badal deta hai; yeh normal hai, aur isiliye aap <i>content</i> se verify karte ho, line order se nahi.</p>

<div class="eg"><p><b>Worked example.</b> 40 switches par rollout: sabhi 40 files render karo; do padho; count check chalao; <b>ek</b> switch push karo aur verify karo; phir agle paanch; phir baaki. Pehle switch mein problem dikhe to sirf ek device prabhavit hota hai, aur fix template edit aur re-render hai.</p></div>

<div class="note"><p><b>Reference code (not run in the simulator).</b> Lab ki push script password code mein rakhti hai taaki exercise simple rahe. Asli scripts mein aisa nahi hona chahiye. Credentials run time par environment ya vault se padho, jaise <code>import os</code> ke baad <code>password = os.environ["NETOPS_PASSWORD"]</code>, aur SSH keys ko prefer karo. Passwords ko version control mein kabhi commit mat karo, aur automation account ko sirf utne privileges do jitne chahiye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Render aur push ek hi script mein karna, jisse kharab render seedha network par jaata hai. Sab kuch ek saath push karna. Save (<code>save_config</code>) na karna, jisse reload par change chala jaata hai. Verify step ke bina "finished" par bharosa karna. Purane data se bane stale <code>configs</code> folder se push karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> <code>send_config_set</code> configuration mode mein kaam karta hai aur config jodta hai; <code>send_command</code> show-type command chalata hai. <i>Running</i> config mein push reload ke baad tab tak nahi bachta jab tak save na karo.</p></div>

<div class="scn"><h4>Push jo galat device par chala</h4><p>Ek engineer ne <code>push.py</code> switch 14 ke hostname aur switch 41 ke management IP ke saath chalayi. Script mein yeh check nahi ki dono ek hi device ke hain, isliye switch 41 ko switch 14 ki config mili aur uske VLAN assignments chale gaye. Baad ke version mein dono values ek hi inventory row se aati hain, aur push script kuch bhejne se pehle device ke apne hostname ko file name se compare karti hai.</p><p><b>Lesson:</b> hostname aur address ek hi source se lo, aur badalne se pehle target check karo.</p></div>

<div class="iv"><p class="q">"Config automation ko safe kaise banate ho?"</p><p>Render ko push se alag rakho; rendered output review karo aur reviewed copy se diff karo; pehle ek device (ya canary group) push karo; push ke baad show commands se verify karo; verification ke baad hi save karo; credentials ko code se bahar rakho; aur log rakho ki kya kis device par bheja. Jodo ki rollback plan, jaise saved purani config, change ka hissa hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pipeline: render, review, push, verify. Render repeatable hai; push nahi.</li>
<li>Review: ek file padho, lines aur ports gino, aur golden copy se diff karo.</li>
<li><code>send_config_set(lines)</code> config lines bhejta hai; <code>save_config()</code> unhe save karta hai.</li>
<li>Device par show command se verify karo; lines ka order alag ho sakta hai.</li>
<li>Pehle ek device push karo aur passwords code mein kabhi mat rakho.</li>
</ul></div>
`}};export{e as default};