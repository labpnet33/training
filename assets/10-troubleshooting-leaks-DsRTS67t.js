var e={id:`troubleshooting-leaks`,h:{en:`Troubleshooting workflow: four leaks in guard.py`,hi:`Troubleshooting workflow: guard.py ke chaar leaks`},body:{en:`
<p><b>The idea of this chapter:</b> Lab 2 hands you a tool that <i>looks</i> careful and runs without a single error. <code>guard.py</code> on AUTO01 connects with credentials from <code>.env</code>, checks that <code>.env</code> is private, masks secrets in a config, and stores and checks user passwords. It leaks four ways. Nothing crashes, so no traceback will help you. You need a method that starts from a <b>symptom</b>, not from an error.</p>

<h3>Analogy: a slow water leak, not a fire alarm</h3>
<p>A fire alarm rings when the building burns. A leak is quieter: the building looks fine while water drips behind a wall. You find it by checking the <i>evidence</i> (the damp patch, the log line, the file mode) and following it back to the pipe.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Workflow: symptom, locate, why, one fix, retest, clean up and rotate">
<rect x="6" y="40" width="94" height="60" rx="10" fill="#fecaca"/><text x="53" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text><text x="53" y="84" text-anchor="middle" class="svg-muted" font-size="10">what is wrong</text>
<rect x="108" y="40" width="94" height="60" rx="10" fill="#fde68a"/><text x="155" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Locate</text><text x="155" y="84" text-anchor="middle" class="svg-muted" font-size="10">grep -n</text>
<rect x="210" y="40" width="94" height="60" rx="10" fill="#bae6fd"/><text x="257" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Why</text><text x="257" y="84" text-anchor="middle" class="svg-muted" font-size="10">read the line</text>
<rect x="312" y="40" width="94" height="60" rx="10" fill="#ddd6fe"/><text x="359" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 One fix</text><text x="359" y="84" text-anchor="middle" class="svg-muted" font-size="10">sed</text>
<rect x="414" y="40" width="94" height="60" rx="10" fill="#bbf7d0"/><text x="461" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Retest</text><text x="461" y="84" text-anchor="middle" class="svg-muted" font-size="10">same input</text>
<rect x="516" y="40" width="118" height="60" rx="10" fill="#fed7aa"/><text x="575" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Clean up</text><text x="575" y="84" text-anchor="middle" class="svg-muted" font-size="10">old data, rotate</text>
<line x1="100" y1="70" x2="108" y2="70" stroke="#64748b" stroke-width="2"/><line x1="202" y1="70" x2="210" y2="70" stroke="#64748b" stroke-width="2"/><line x1="304" y1="70" x2="312" y2="70" stroke="#64748b" stroke-width="2"/><line x1="406" y1="70" x2="414" y2="70" stroke="#64748b" stroke-width="2"/><line x1="508" y1="70" x2="516" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Step 6 matters for secrets: a fixed tool can still leave the old evidence behind.</p></div>

<p>Use <code>grep -n</code> to locate a line. (<code>nl guard.py</code> also numbers lines, but it skips blank lines, so its numbers can be smaller than the real ones.) Change <b>one</b> thing at a time and retest with the <b>same input</b>.</p>

<h3>Leak 1: the password is in the log</h3>
<p><b>Symptom.</b> Run a normal connection, then read the audit log that the tool writes.</p>
<pre class="out">AUTO01$ python3 guard.py connect R1
R1: hostname PUN-CORE-R1
AUTO01$ cat audit.log
2026-09-29 09:00:03,000 connect R1 user=netops <span class="hl">password=NK@2026</span>
AUTO01$ grep -c NK@2026 audit.log
1</pre>
<p>The Lab 2 answer is <b>1</b>. <b>Locate and read.</b> The line in <code>cmd_connect</code> hands the variable <code>password</code> to <code>logging.info</code>, as in chapter 7:</p>
<pre class="out">AUTO01$ grep -n "logging.info" guard.py
35:    logging.info("connect %s user=%s <span class="hl">password=%s</span>", args.name, user, password)</pre>
<p><b>Fix.</b> Remove the placeholder and the argument. <b>Clean up.</b> The old log still holds the secret, so delete it, reconnect and count again.</p>
<pre class="out">AUTO01$ sed -i 's/ password=%s", args.name, user, password)/", args.name, user)/' guard.py
AUTO01$ rm audit.log
AUTO01$ python3 guard.py connect R1
R1: hostname PUN-CORE-R1
AUTO01$ cat audit.log
2026-09-29 09:00:06,000 connect R1 user=netops
AUTO01$ grep -c NK@2026 audit.log
<span class="hl">0</span></pre>
<p>In production the password was exposed for as long as the old log existed, so it must also be <b>rotated</b>.</p>

<h3>Leak 2: envcheck says OK for a file everybody can read</h3>
<p><b>Symptom.</b> A colleague opens the file for others with <code>chmod 604 .env</code>. The tool should warn. It does not.</p>
<pre class="out">AUTO01$ chmod 604 .env
AUTO01$ ls -l .env
-rw----r--  1 netadmin netadmin     31 Sep 29 09:00 .env
AUTO01$ python3 guard.py envcheck
<span class="hl">OK: .env is private</span></pre>
<p><b>Locate and read.</b> The decision is made by one line of <code>env_is_private</code>:</p>
<pre class="out">AUTO01$ grep -n "return not" guard.py
44:    return not (mode &amp; 0o070)</pre>
<p>The mask <code>0o070</code> selects only the <b>group</b> bits. Mode 604 has group bits 0 and others bits 4, so the result is 0 and the function answers "private". The others' bits (<code>0o007</code>) are never looked at. This is the mask problem from chapter 5. <b>Fix.</b> Accept only the two modes that are really private:</p>
<pre class="out">AUTO01$ sed -i 's/^    return not .*/    return mode in (0o600, 0o400)/' guard.py
AUTO01$ python3 guard.py envcheck
<span class="hl">WARNING: .env is readable by others - run chmod 600 .env</span>
AUTO01$ chmod 600 .env
AUTO01$ python3 guard.py envcheck
OK: .env is private</pre>
<p>Both directions are tested: the bad mode warns, the good mode passes. Lab 2 asks for the first word printed with mode 604 before the fix: <b>OK</b>.</p>

<h3>Leak 3: redaction lets type 9 secrets through</h3>
<p><b>Symptom.</b> Mask the sample configuration that is about to go into a ticket, and look for hashes that survived.</p>
<pre class="out">AUTO01$ python3 guard.py redact sample.cfg
hostname EDGE-R9
enable secret 9 $9$hH3f2ZkQ$pN8vK1sWj4Ld0xTq
username ops privilege 15 secret 9 $9$aB7cD2eF$gH4iJ5kL6mN7oP8q
username old secret &lt;hidden&gt;
snmp-server community NKRO RO
line vty 0 4
 password &lt;hidden&gt;
 login
AUTO01$ python3 guard.py redact sample.cfg | grep -c 'secret 9'
<span class="hl">2</span></pre>
<p>Two lines still leak. The Lab 2 answer is <b>2</b>. <b>Locate and read.</b></p>
<pre class="out">AUTO01$ grep -n "SECRET_RE = " guard.py
22:SECRET_RE = re.compile(r"(secret|password) <span class="hl">(0|5|7)</span> \\S+")</pre>
<p>The pattern only knows the types 0, 5 and 7. Modern IOS XE writes types 8 and 9, and these lines are not matched. <b>Fix.</b> Replace the list by the character class <code>[0-9]</code>:</p>
<pre class="out">AUTO01$ sed -i 's/ (0|5|7) / [0-9] /' guard.py
AUTO01$ python3 guard.py redact sample.cfg
hostname EDGE-R9
enable secret &lt;hidden&gt;
username ops privilege 15 secret &lt;hidden&gt;
username old secret &lt;hidden&gt;
snmp-server community NKRO RO
line vty 0 4
 password &lt;hidden&gt;
 login</pre>
<p>Every secret and password line is masked now. Read the output with care, as chapter 7 taught: <code>snmp-server community NKRO RO</code> is <b>still visible</b> and the pattern still ignores a plain <code>password cisco123</code> without a type digit. Those are two follow-up tickets, outside the four leaks of this lab.</p>

<h3>Leak 4: two users, the same stored hash</h3>
<p><b>Symptom.</b> Store alice and bob with the same password and read the user file.</p>
<pre class="out">AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser alice
New password: user alice saved
AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser bob
New password: user bob saved
AUTO01$ cat users.json
{
  "alice": "7dee20a0f845e67f$<span class="hl">52b8c23bedb17d808062e3ef20aff8f3a80863157fffe28ffe7c8ff5d5fdbd1b</span>",
  "bob": "7042c7a805ac26ec$<span class="hl">52b8c23bedb17d808062e3ef20aff8f3a80863157fffe28ffe7c8ff5d5fdbd1b</span>"
}</pre>
<p>The part after the <code>$</code> is identical, so the answer is <b>yes</b>. (The salts in front differ, and they differ on every run of yours.) <b>Locate and read.</b> The function creates a random salt and then never uses it:</p>
<pre class="out">AUTO01$ grep -n "hexdigest" guard.py
64:    digest = hashlib.sha256(pw.encode()).hexdigest()</pre>
<p>The digest is plain sha256 of the password alone: no salt inside, and fast. This is chapter 8. <b>Fix.</b> Use pbkdf2 with the salt, then clear the old users, because their stored values are weak and must be created again.</p>
<pre class="out">AUTO01$ sed -i 's/hashlib.sha256(pw.encode()).hexdigest()/hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 20000).hex()/' guard.py
AUTO01$ rm users.json
AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser alice
New password: user alice saved
AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser bob
New password: user bob saved
AUTO01$ cat users.json
{
  "alice": "23cb1db3f88a74e1$<span class="hl">db220e97ed3fc11aa8d83b48628ff138e19505a57d7e010fe37b1822c77704bf</span>",
  "bob": "9cd5698aee56ebc8$<span class="hl">3b9dd37e1a7f7ee3bcb3521a503765d91c22afaca6d8f16756796687b7a86c88</span>"
}
AUTO01$ printf 'NK@2026\\n' | python3 guard.py login alice
Password: login ok
AUTO01$ printf 'nope\\n' | python3 guard.py login alice
Password: login denied</pre>
<p>The digests now differ, the right password gets <code>login ok</code>, a wrong one gets <code>login denied</code>. The lab uses 20000 iterations; a real tool uses hundreds of thousands.</p>

<div class="eg"><p><b>Worked example.</b> The closing note for the change ticket, in the style of a real hand-over: "Four leaks fixed in guard.py: password removed from the audit log (old log deleted, router password rotated); env_is_private now accepts only modes 600 and 400; SECRET_RE covers types 0 to 9; user passwords are stored with a per-user salt and pbkdf2_hmac. Open items: SNMP community masking, type-less password lines." Each fix names the symptom, the cause and the evidence.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Fixing the log call but leaving <code>audit.log</code> in place. Testing the permission check only with the good mode. Declaring the redaction done after seeing one masked line. Changing the hash function but keeping the old <code>users.json</code>, so old weak entries stay. Forgetting to rotate a password that was logged.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The script runs without errors" does not mean it is safe. Secret hygiene problems rarely raise exceptions; you find them by testing the <i>output</i> (log, files, masked text, stored hashes), not the exit code.</p></div>

<div class="scn"><h4>The helper that everybody trusted</h4><p>A team's shared helper had passed review because it worked and had a function called <code>env_is_private</code>. Months later an auditor tried mode 604 and got a green OK. Fixing the mask took one line; finding that a month of logs also held the password took a day.</p><p><b>Lesson:</b> test security checks with the bad case, and look at what the tool leaves on disk.</p></div>

<div class="iv"><p class="q">"A security helper script runs fine but a reviewer says it leaks. How do you investigate?"</p><p>I start from the reviewer's symptoms and check the artefacts: logs for secret values, file modes against a deliberately bad mode, redaction output against a sample with every password type, and stored hashes for two users with the same password. I locate each cause with <code>grep -n</code>, make one change at a time, retest with the same input, then clean up old logs and files and rotate any secret that was exposed.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work from symptom to cause: symptom, locate with <code>grep -n</code>, read, one fix, retest, clean up.</li>
<li>Leak 1: remove the password from the log call, delete the old log, rotate.</li>
<li>Leak 2: the mask <code>0o070</code> ignored others; accept only 600 or 400.</li>
<li>Leak 3: <code>(0|5|7)</code> misses types 8 and 9; use <code>[0-9]</code>.</li>
<li>Leak 4: unsalted sha256 gives equal hashes; use salted <code>pbkdf2_hmac</code> and recreate old entries.</li>
</ul></div>
`,hi:`
<p><b>Is chapter ka idea:</b> Lab 2 aapko aisa tool deta hai jo <i>careful dikhta hai</i> aur ek bhi error ke bina chalta hai. AUTO01 par <code>guard.py</code> <code>.env</code> ke credentials se connect karta hai, check karta hai ki <code>.env</code> private hai, config ke secrets mask karta hai, aur user passwords store aur check karta hai. Yeh chaar tareeqon se leak karta hai. Kuch crash nahi hota, isliye koi traceback madad nahi karega. Aapko aisa method chahiye jo error se nahi, <b>symptom</b> se shuru ho.</p>

<h3>Analogy: dheere paani ka leak, fire alarm nahi</h3>
<p>Fire alarm tab bajta hai jab building jal rahi ho. Leak shaant hota hai: building theek dikhti hai aur deewar ke peeche paani tapakta hai. Aap use <i>saboot</i> (geela dhabba, log line, file mode) check karke aur pipe tak peeche chalkar dhoondhte ho.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Workflow: symptom, jagah, kyon, ek fix, retest, safai aur rotate">
<rect x="6" y="40" width="94" height="60" rx="10" fill="#fecaca"/><text x="53" y="66" text-anchor="middle" class="svg-ink" font-size="12">1 Symptom</text><text x="53" y="84" text-anchor="middle" class="svg-muted" font-size="10">kya galat hai</text>
<rect x="108" y="40" width="94" height="60" rx="10" fill="#fde68a"/><text x="155" y="66" text-anchor="middle" class="svg-ink" font-size="12">2 Jagah</text><text x="155" y="84" text-anchor="middle" class="svg-muted" font-size="10">grep -n</text>
<rect x="210" y="40" width="94" height="60" rx="10" fill="#bae6fd"/><text x="257" y="66" text-anchor="middle" class="svg-ink" font-size="12">3 Kyon</text><text x="257" y="84" text-anchor="middle" class="svg-muted" font-size="10">line padho</text>
<rect x="312" y="40" width="94" height="60" rx="10" fill="#ddd6fe"/><text x="359" y="66" text-anchor="middle" class="svg-ink" font-size="12">4 Ek fix</text><text x="359" y="84" text-anchor="middle" class="svg-muted" font-size="10">sed</text>
<rect x="414" y="40" width="94" height="60" rx="10" fill="#bbf7d0"/><text x="461" y="66" text-anchor="middle" class="svg-ink" font-size="12">5 Retest</text><text x="461" y="84" text-anchor="middle" class="svg-muted" font-size="10">wahi input</text>
<rect x="516" y="40" width="118" height="60" rx="10" fill="#fed7aa"/><text x="575" y="66" text-anchor="middle" class="svg-ink" font-size="12">6 Safai</text><text x="575" y="84" text-anchor="middle" class="svg-muted" font-size="10">purana data, rotate</text>
<line x1="100" y1="70" x2="108" y2="70" stroke="#64748b" stroke-width="2"/><line x1="202" y1="70" x2="210" y2="70" stroke="#64748b" stroke-width="2"/><line x1="304" y1="70" x2="312" y2="70" stroke="#64748b" stroke-width="2"/><line x1="406" y1="70" x2="414" y2="70" stroke="#64748b" stroke-width="2"/><line x1="508" y1="70" x2="516" y2="70" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Secrets ke liye step 6 maayne rakhta hai: theek hua tool bhi purana saboot chhod sakta hai.</p></div>

<p>Line dhoondhne ke liye <code>grep -n</code> use karo. (<code>nl guard.py</code> bhi lines number karta hai, par woh blank lines chhod deta hai, isliye uske numbers asli numbers se chhote ho sakte hain.) Ek baar mein <b>ek</b> cheez badlo aur <b>wahi input</b> se retest karo.</p>

<h3>Leak 1: password log mein hai</h3>
<p><b>Symptom.</b> Normal connection chalao, phir tool ka likha audit log padho.</p>
<pre class="out">AUTO01$ python3 guard.py connect R1
R1: hostname PUN-CORE-R1
AUTO01$ cat audit.log
2026-09-29 09:00:03,000 connect R1 user=netops <span class="hl">password=NK@2026</span>
AUTO01$ grep -c NK@2026 audit.log
1</pre>
<p>Lab 2 ka jawab <b>1</b> hai. <b>Jagah aur padhna.</b> <code>cmd_connect</code> ki line variable <code>password</code> ko <code>logging.info</code> ko deti hai, jaisa chapter 7 mein:</p>
<pre class="out">AUTO01$ grep -n "logging.info" guard.py
35:    logging.info("connect %s user=%s <span class="hl">password=%s</span>", args.name, user, password)</pre>
<p><b>Fix.</b> Placeholder aur argument hatao. <b>Safai.</b> Purane log mein abhi bhi secret hai, isliye use delete karo, dobara connect karo aur phir gino.</p>
<pre class="out">AUTO01$ sed -i 's/ password=%s", args.name, user, password)/", args.name, user)/' guard.py
AUTO01$ rm audit.log
AUTO01$ python3 guard.py connect R1
R1: hostname PUN-CORE-R1
AUTO01$ cat audit.log
2026-09-29 09:00:06,000 connect R1 user=netops
AUTO01$ grep -c NK@2026 audit.log
<span class="hl">0</span></pre>
<p>Production mein password utni der exposed raha jitni der purana log tha, isliye use <b>rotate</b> bhi karna hai.</p>

<h3>Leak 2: envcheck aisi file ko OK kehta hai jise sab padh sakte hain</h3>
<p><b>Symptom.</b> Ek colleague <code>chmod 604 .env</code> se file doosron ke liye kholta hai. Tool ko warn karna chahiye. Karta nahi.</p>
<pre class="out">AUTO01$ chmod 604 .env
AUTO01$ ls -l .env
-rw----r--  1 netadmin netadmin     31 Sep 29 09:00 .env
AUTO01$ python3 guard.py envcheck
<span class="hl">OK: .env is private</span></pre>
<p><b>Jagah aur padhna.</b> Faisla <code>env_is_private</code> ki ek line karti hai:</p>
<pre class="out">AUTO01$ grep -n "return not" guard.py
44:    return not (mode &amp; 0o070)</pre>
<p>Mask <code>0o070</code> sirf <b>group</b> bits chunta hai. Mode 604 mein group bits 0 aur others bits 4 hain, isliye result 0 aata hai aur function "private" kehta hai. Others ke bits (<code>0o007</code>) kabhi dekhe hi nahi jaate. Yeh chapter 5 ki mask wali problem hai. <b>Fix.</b> Sirf woh do modes maano jo sach mein private hain:</p>
<pre class="out">AUTO01$ sed -i 's/^    return not .*/    return mode in (0o600, 0o400)/' guard.py
AUTO01$ python3 guard.py envcheck
<span class="hl">WARNING: .env is readable by others - run chmod 600 .env</span>
AUTO01$ chmod 600 .env
AUTO01$ python3 guard.py envcheck
OK: .env is private</pre>
<p>Dono taraf test hue: bura mode warn karta hai, achha mode pass hota hai. Lab 2 fix se pehle mode 604 par print hone wala pehla shabd maangta hai: <b>OK</b>.</p>

<h3>Leak 3: redaction type 9 secrets ko nikalne deta hai</h3>
<p><b>Symptom.</b> Ticket mein jaane wali sample configuration mask karo, aur dekho kaun se hashes bach gaye.</p>
<pre class="out">AUTO01$ python3 guard.py redact sample.cfg
hostname EDGE-R9
enable secret 9 $9$hH3f2ZkQ$pN8vK1sWj4Ld0xTq
username ops privilege 15 secret 9 $9$aB7cD2eF$gH4iJ5kL6mN7oP8q
username old secret &lt;hidden&gt;
snmp-server community NKRO RO
line vty 0 4
 password &lt;hidden&gt;
 login
AUTO01$ python3 guard.py redact sample.cfg | grep -c 'secret 9'
<span class="hl">2</span></pre>
<p>Do lines abhi bhi leak karti hain. Lab 2 ka jawab <b>2</b> hai. <b>Jagah aur padhna.</b></p>
<pre class="out">AUTO01$ grep -n "SECRET_RE = " guard.py
22:SECRET_RE = re.compile(r"(secret|password) <span class="hl">(0|5|7)</span> \\S+")</pre>
<p>Pattern sirf types 0, 5 aur 7 jaanta hai. Modern IOS XE types 8 aur 9 likhta hai, aur woh lines match nahi hoti. <b>Fix.</b> List ko character class <code>[0-9]</code> se badlo:</p>
<pre class="out">AUTO01$ sed -i 's/ (0|5|7) / [0-9] /' guard.py
AUTO01$ python3 guard.py redact sample.cfg
hostname EDGE-R9
enable secret &lt;hidden&gt;
username ops privilege 15 secret &lt;hidden&gt;
username old secret &lt;hidden&gt;
snmp-server community NKRO RO
line vty 0 4
 password &lt;hidden&gt;
 login</pre>
<p>Ab har secret aur password line mask hai. Output ko dhyan se padho, jaisa chapter 7 ne sikhaya: <code>snmp-server community NKRO RO</code> <b>abhi bhi dikhta hai</b> aur pattern abhi bhi type digit ke bina plain <code>password cisco123</code> ko ignore karta hai. Yeh do follow-up tickets hain, is lab ke chaar leaks ke bahar.</p>

<h3>Leak 4: do users, ek jaisa stored hash</h3>
<p><b>Symptom.</b> Alice aur bob ko same password ke saath store karo aur user file padho.</p>
<pre class="out">AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser alice
New password: user alice saved
AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser bob
New password: user bob saved
AUTO01$ cat users.json
{
  "alice": "7dee20a0f845e67f$<span class="hl">52b8c23bedb17d808062e3ef20aff8f3a80863157fffe28ffe7c8ff5d5fdbd1b</span>",
  "bob": "7042c7a805ac26ec$<span class="hl">52b8c23bedb17d808062e3ef20aff8f3a80863157fffe28ffe7c8ff5d5fdbd1b</span>"
}</pre>
<p><code>$</code> ke baad ka hissa same hai, isliye jawab <b>yes</b> hai. (Aage ke salts alag hain, aur aapke har run mein alag honge.) <b>Jagah aur padhna.</b> Function random salt banata hai aur phir use kabhi use nahi karta:</p>
<pre class="out">AUTO01$ grep -n "hexdigest" guard.py
64:    digest = hashlib.sha256(pw.encode()).hexdigest()</pre>
<p>Digest sirf password ka plain sha256 hai: andar salt nahi, aur tez. Yeh chapter 8 hai. <b>Fix.</b> Salt ke saath pbkdf2 use karo, phir purane users hatao, kyunki unki stored values kamzor hain aur dobara banani hongi.</p>
<pre class="out">AUTO01$ sed -i 's/hashlib.sha256(pw.encode()).hexdigest()/hashlib.pbkdf2_hmac("sha256", pw.encode(), salt.encode(), 20000).hex()/' guard.py
AUTO01$ rm users.json
AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser alice
New password: user alice saved
AUTO01$ printf 'NK@2026\\n' | python3 guard.py adduser bob
New password: user bob saved
AUTO01$ cat users.json
{
  "alice": "23cb1db3f88a74e1$<span class="hl">db220e97ed3fc11aa8d83b48628ff138e19505a57d7e010fe37b1822c77704bf</span>",
  "bob": "9cd5698aee56ebc8$<span class="hl">3b9dd37e1a7f7ee3bcb3521a503765d91c22afaca6d8f16756796687b7a86c88</span>"
}
AUTO01$ printf 'NK@2026\\n' | python3 guard.py login alice
Password: login ok
AUTO01$ printf 'nope\\n' | python3 guard.py login alice
Password: login denied</pre>
<p>Digests ab alag hain, sahi password par <code>login ok</code> aur galat par <code>login denied</code> milta hai. Lab 20000 iterations use karta hai; asli tool lakhon use karta hai.</p>

<div class="eg"><p><b>Worked example.</b> Change ticket ka closing note, asli hand-over ke style mein: "guard.py ke chaar leaks fix: audit log se password hataya (purana log delete, router password rotate); env_is_private ab sirf modes 600 aur 400 maanta hai; SECRET_RE types 0 se 9 cover karta hai; user passwords per-user salt aur pbkdf2_hmac se store hote hain. Open items: SNMP community masking, type-less password lines." Har fix symptom, cause aur saboot ka naam leta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Log call theek karna par <code>audit.log</code> wahin chhod dena. Permission check ko sirf achhe mode se test karna. Ek masked line dekhkar redaction ko poora maan lena. Hash function badalna par purani <code>users.json</code> rakhna, jisse purani kamzor entries rehti hain. Jo password log hua use rotate karna bhool jaana.</p></div>
<div class="exam"><p><b>Exam trap.</b> "Script bina error ke chalti hai" ka matlab safe hona nahi hai. Secret hygiene ki problems par kam hi exception aata hai; aap unhe <i>output</i> (log, files, masked text, stored hashes) test karke dhoondhte ho, exit code se nahi.</p></div>

<div class="scn"><h4>Helper jis par sab bharosa karte the</h4><p>Ek team ka shared helper review pass kar gaya kyunki woh chalta tha aur uska ek function <code>env_is_private</code> naam ka tha. Mahino baad ek auditor ne mode 604 try kiya aur hara OK paaya. Mask fix karne mein ek line lagi; yeh dhoondhne mein ek din laga ki ek mahine ke logs mein bhi password tha.</p><p><b>Lesson:</b> security checks ko bure case se test karo, aur dekho ki tool disk par kya chhodta hai.</p></div>

<div class="iv"><p class="q">"Ek security helper script theek chalti hai par reviewer kehta hai ki leak karti hai. Kaise investigate karoge?"</p><p>Main reviewer ke symptoms se shuru karta hoon aur artefacts check karta hoon: logs mein secret values, file modes ko jaan-boojhkar bure mode ke saath, redaction output ko har password type wale sample ke saath, aur same password wale do users ke stored hashes. Har cause ko <code>grep -n</code> se dhoondhta hoon, ek ek change karta hoon, wahi input se retest karta hoon, phir purane logs aur files saaf karta hoon aur exposed hue har secret ko rotate karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Symptom se cause tak kaam karo: symptom, <code>grep -n</code> se jagah, padhna, ek fix, retest, safai.</li>
<li>Leak 1: log call se password hatao, purana log delete karo, rotate karo.</li>
<li>Leak 2: mask <code>0o070</code> others ko bhool gaya; sirf 600 ya 400 maano.</li>
<li>Leak 3: <code>(0|5|7)</code> types 8 aur 9 chhod deta hai; <code>[0-9]</code> use karo.</li>
<li>Leak 4: bina salt ka sha256 barabar hashes deta hai; salt wala <code>pbkdf2_hmac</code> use karo aur purani entries dobara banao.</li>
</ul></div>
`}};export{e as default};