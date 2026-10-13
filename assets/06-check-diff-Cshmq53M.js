var e={id:`check-diff`,h:{en:`Dry run, real run, second run: --check --diff and idempotency (Lab 1, steps 3 to 5)`,hi:`Dry run, real run, doosra run: --check --diff aur idempotency (Lab 1, steps 3 se 5)`},body:{en:`
<p>A multivendor change needs a review step that works the same way on every vendor. Ansible gives you one: <b>check mode</b> (<code>--check</code>) asks every module "what would you change?" without changing anything, and <code>--diff</code> prints the lines. Together they are your change-ticket evidence. This chapter runs the baseline three times: dry, real, and again.</p>

<h3>Step 3: the dry run</h3>
<p>Run the playbook from Chapter 5 with <code>--check --diff</code>. Read each vendor's diff in its own style:</p>
<pre class="out">AUTO01$ ansible-playbook baseline.yml --check --diff
PLAY [Baseline NTP and syslog on IOS XE, Junos and EOS] ***********************
TASK [IOS XE baseline] ********************************************************
--- before: running-config
+++ after: running-config
@@ -51,4 +51,6 @@
 !
 netconf-yang
 !
<span class="hl">+ntp server 192.0.2.123
+logging host 192.0.2.50</span>
 end
changed: [R1]
skipping: [J1]
skipping: [E1]
TASK [Junos baseline] *********************************************************
skipping: [R1]
[edit system]
+   syslog {
+       host 192.0.2.50 {
+           any notice;
+       }
+   }
+   ntp {
+       server 192.0.2.123;
+   }
changed: [J1]
skipping: [E1]
TASK [EOS baseline] ***********************************************************
skipping: [R1]
skipping: [J1]
--- system:/running-config
+++ session:/ansible_1790672436-session-config
@@ -13,6 +13,10 @@
    no switchport
    ip address 10.99.0.21/24
 !
+logging host 192.0.2.50
+!
+ntp server 192.0.2.123
+!
 username netops privilege 15 secret sha512 $6$nk.....$...
 !
 management api h&#116;tp-commands
changed: [E1]
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0</pre>
<p>Three vendors, three diff styles: a unified diff of the running-config on IOS XE, the Junos <code>show | compare</code> format with <code>[edit system]</code> headers, and the EOS session diff. The session number in the EOS file name changes on every run, and the long username line is shortened here. Nothing has changed on any device yet; the three <code>changed</code> values are predictions.</p>
<p>How does a module dry-run on a platform with no dry-run command? It uses the platform's own safe path. On Junos it loads the lines into the candidate, runs the compare, then discards. On EOS it opens a configuration session, reads the session diff and aborts it. On IOS XE it builds the predicted configuration and diffs it against the running one.</p>

<h3>Step 4: the real run</h3>
<pre class="out">AUTO01$ ansible-playbook baseline.yml
TASK [IOS XE baseline] ********************************************************
<span class="hl">changed: [R1]</span>
skipping: [J1]
skipping: [E1]
TASK [Junos baseline] *********************************************************
skipping: [R1]
<span class="hl">changed: [J1]</span>
skipping: [E1]
TASK [EOS baseline] ***********************************************************
skipping: [R1]
skipping: [J1]
<span class="hl">changed: [E1]</span>
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1&gt; show system commit
0   2026-10-11 14:49:12 UTC by netops via netconf
    ansible baseline
1   2026-10-11 14:48:24 UTC by root via other</pre>
<p>Every host changed exactly once. The Junos commit log keeps the <code>comment</code> from the task, which links the change on the router to the playbook that made it. Use the same trick on every change: comment with the ticket number.</p>

<h3>Step 5: the second run is the real test</h3>
<pre class="out">AUTO01$ ansible-playbook baseline.yml
TASK [IOS XE baseline] ********************************************************
<span class="hl">ok: [R1]</span>
skipping: [J1]
skipping: [E1]
TASK [Junos baseline] *********************************************************
skipping: [R1]
<span class="hl">ok: [J1]</span>
skipping: [E1]
TASK [EOS baseline] ***********************************************************
skipping: [R1]
skipping: [J1]
<span class="hl">ok: [E1]</span>
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0</pre>
<p><code>changed=0</code> on every host: the playbook is <b>idempotent</b>. This is the proof that the desired state is on the devices, and it is also your drift detector. Run the same playbook with <code>--check</code> next week: any host that reports <i>changed</i> has drifted from the standard.</p>

<table class="cmp"><tr><th>Recap column</th><th>Means</th></tr>
<tr><td><code>ok</code></td><td>Tasks that ran without failure, changed or not</td></tr>
<tr><td><code>changed</code></td><td>Tasks that altered (or in check mode would alter) the device</td></tr>
<tr><td><code>skipped</code></td><td>Tasks whose <code>when</code> guard was false for that host</td></tr>
<tr><td><code>unreachable</code>, <code>failed</code></td><td>Could not connect, or the module returned an error</td></tr></table>

<h3>Rolling out safely: limit, list, canary</h3>
<p>You do not have to touch the whole fleet to test a change. <code>-l J1</code> limits a run to one host or group, <code>--list-hosts</code> prints what a play would reach, and <code>--syntax-check</code> parses the playbook without connecting:</p>
<pre class="out">AUTO01$ ansible-playbook baseline.yml --list-hosts
playbook: baseline.yml
  play #1 (network): Baseline NTP and syslog on IOS XE, Junos and EOS    TAGS: []
    pattern: ['network']
    hosts (3):
      R1
      J1
      E1
AUTO01$ ansible-playbook baseline.yml --syntax-check
playbook: baseline.yml</pre>
<p>A good habit is dry run on the fleet, real run on one canary with <code>-l</code>, check the result, then the real run on the rest.</p>

<div class="eg"><p><b>Worked example: reading the numbers.</b> A dry run on 60 devices shows <code>changed=60</code> on the first day and <code>changed=2</code> a month later. The 58 clean hosts are your standard; the 2 are drift. Open their diffs, decide whether the device or the standard is wrong, and fix the right one.</p></div>
<div class="warn"><p><b>Common mistake.</b> Trusting the dry run for tasks that run show commands or other read-only modules. They report <i>ok</i> in check mode because they change nothing, so a clean dry run does not prove that every command would be accepted. The real device decides that.</p></div>
<div class="exam"><p><b>Exam trap.</b> Check mode never changes a device, but it still logs in and reads. <code>--diff</code> shows the lines; without it you only see <i>changed</i>. Idempotent means the second run reports <code>changed=0</code>.</p></div>

<div class="scn"><h4>The diff that stopped a change</h4><p>An engineer prepared an NTP change for an EOS pair and ran <code>--check --diff</code> as the ticket required. The diff showed an extra line she did not expect: the playbook was about to add a logging host that an earlier colleague had removed on purpose. She raised it in the review, the line was taken out of the shared variables, and the change went ahead with only the NTP line.</p><p><b>Lesson:</b> the diff is the implementation plan. Read it as the reviewer would.</p></div>
<div class="iv"><p class="q">"What does idempotent mean, and how do you prove it with Ansible?"</p><p>Running the same playbook twice leaves the same state, and the second run changes nothing. I prove it by running it again and checking <code>changed=0</code> for every host. I also use <code>--check --diff</code> before the first run as the review evidence.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>--check</code> predicts changes without making them; <code>--diff</code> prints the lines.</li>
<li>Each vendor dry-runs in its own safe way: Junos compare, EOS session diff, IOS XE predicted config.</li>
<li>The second run must say <code>changed=0</code>; that is the proof and the drift detector.</li>
<li>Use <code>-l</code> for a canary, <code>--list-hosts</code> to see the scope, <code>--syntax-check</code> to parse.</li>
<li>Comment Junos commits with the ticket number.</li></ul></div>
`,hi:`
<p>Multivendor change ko aisa review step chahiye jo har vendor par ek jaisa chale. Ansible ek deta hai: <b>check mode</b> (<code>--check</code>) har module se poochta hai "tum kya badaloge?" bina kuch badle, aur <code>--diff</code> lines print karta hai. Dono milkar aapke change ticket ka saboot hain. Yeh chapter baseline ko teen baar chalata hai: dry, real, aur phir se.</p>

<h3>Step 3: dry run</h3>
<p>Chapter 5 ki playbook ko <code>--check --diff</code> ke saath chalao. Har vendor ka diff uski apni style mein padho:</p>
<pre class="out">AUTO01$ ansible-playbook baseline.yml --check --diff
PLAY [Baseline NTP and syslog on IOS XE, Junos and EOS] ***********************
TASK [IOS XE baseline] ********************************************************
--- before: running-config
+++ after: running-config
@@ -51,4 +51,6 @@
 !
 netconf-yang
 !
<span class="hl">+ntp server 192.0.2.123
+logging host 192.0.2.50</span>
 end
changed: [R1]
skipping: [J1]
skipping: [E1]
TASK [Junos baseline] *********************************************************
skipping: [R1]
[edit system]
+   syslog {
+       host 192.0.2.50 {
+           any notice;
+       }
+   }
+   ntp {
+       server 192.0.2.123;
+   }
changed: [J1]
skipping: [E1]
TASK [EOS baseline] ***********************************************************
skipping: [R1]
skipping: [J1]
--- system:/running-config
+++ session:/ansible_1790672436-session-config
@@ -13,6 +13,10 @@
    no switchport
    ip address 10.99.0.21/24
 !
+logging host 192.0.2.50
+!
+ntp server 192.0.2.123
+!
 username netops privilege 15 secret sha512 $6$nk.....$...
 !
 management api h&#116;tp-commands
changed: [E1]
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0</pre>
<p>Teen vendors, teen diff styles: IOS XE par running-config ka unified diff, Junos ka <code>show | compare</code> format <code>[edit system]</code> headers ke saath, aur EOS ka session diff. EOS file name ka session number har run par badalta hai, aur lambi username line yahan chhoti ki gayi hai. Abhi kisi device par kuch nahi badla; teen <code>changed</code> predictions hain.</p>
<p>Jis platform par dry-run command hi nahi, wahan module dry-run kaise karta hai? Woh platform ka apna safe raasta use karta hai. Junos par lines candidate mein load hoti hain, compare chalta hai, phir discard. EOS par configuration session khulta hai, session diff padha jaata hai aur abort ho jaata hai. IOS XE par predicted configuration banti hai aur running se diff hoti hai.</p>

<h3>Step 4: real run</h3>
<pre class="out">AUTO01$ ansible-playbook baseline.yml
TASK [IOS XE baseline] ********************************************************
<span class="hl">changed: [R1]</span>
skipping: [J1]
skipping: [E1]
TASK [Junos baseline] *********************************************************
skipping: [R1]
<span class="hl">changed: [J1]</span>
skipping: [E1]
TASK [EOS baseline] ***********************************************************
skipping: [R1]
skipping: [J1]
<span class="hl">changed: [E1]</span>
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1&gt; show system commit
0   2026-10-11 14:49:12 UTC by netops via netconf
    ansible baseline
1   2026-10-11 14:48:24 UTC by root via other</pre>
<p>Har host sirf ek baar change hua. Junos commit log task ka <code>comment</code> rakhta hai, jo router par change ko us playbook se jodta hai jisne use kiya. Har change par yahi trick use karo: ticket number ke saath comment.</p>

<h3>Step 5: doosra run asli test hai</h3>
<pre class="out">AUTO01$ ansible-playbook baseline.yml
TASK [IOS XE baseline] ********************************************************
<span class="hl">ok: [R1]</span>
skipping: [J1]
skipping: [E1]
TASK [Junos baseline] *********************************************************
skipping: [R1]
<span class="hl">ok: [J1]</span>
skipping: [E1]
TASK [EOS baseline] ***********************************************************
skipping: [R1]
skipping: [J1]
<span class="hl">ok: [E1]</span>
PLAY RECAP ********************************************************************
R1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
J1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0
E1                         : ok=1    changed=0    unreachable=0    failed=0    skipped=2    rescued=0    ignored=0</pre>
<p>Har host par <code>changed=0</code>: playbook <b>idempotent</b> hai. Yeh saboot hai ki desired state devices par hai, aur yahi aapka drift detector bhi hai. Agle hafte wahi playbook <code>--check</code> ke saath chalao: jo host <i>changed</i> batata hai woh standard se bhatak gaya hai.</p>

<table class="cmp"><tr><th>Recap column</th><th>Matlab</th></tr>
<tr><td><code>ok</code></td><td>Woh tasks jo bina failure ke chale, changed ho ya na ho</td></tr>
<tr><td><code>changed</code></td><td>Woh tasks jinhone device badla (ya check mode mein badalte)</td></tr>
<tr><td><code>skipped</code></td><td>Woh tasks jinka <code>when</code> guard us host ke liye false tha</td></tr>
<tr><td><code>unreachable</code>, <code>failed</code></td><td>Connect nahi hua, ya module ne error lautaya</td></tr></table>

<h3>Safe rollout: limit, list, canary</h3>
<p>Change test karne ke liye poore fleet ko chhuna zaroori nahi. <code>-l J1</code> run ko ek host ya group tak limit karta hai, <code>--list-hosts</code> print karta hai ki play kahan tak pahunchegi, aur <code>--syntax-check</code> bina connect kiye playbook parse karta hai:</p>
<pre class="out">AUTO01$ ansible-playbook baseline.yml --list-hosts
playbook: baseline.yml
  play #1 (network): Baseline NTP and syslog on IOS XE, Junos and EOS    TAGS: []
    pattern: ['network']
    hosts (3):
      R1
      J1
      E1
AUTO01$ ansible-playbook baseline.yml --syntax-check
playbook: baseline.yml</pre>
<p>Achhi aadat: fleet par dry run, ek canary par <code>-l</code> se real run, result check, phir baaki par real run.</p>

<div class="eg"><p><b>Worked example: numbers padhna.</b> 60 devices par dry run pehle din <code>changed=60</code> dikhata hai aur ek mahine baad <code>changed=2</code>. 58 saaf hosts aapka standard hain; 2 drift hain. Unke diffs kholo, tay karo ki device galat hai ya standard, aur sahi wale ko theek karo.</p></div>
<div class="warn"><p><b>Common mistake.</b> Un tasks ke liye dry run par bharosa karna jo show commands ya doosre read-only modules chalate hain. Woh check mode mein <i>ok</i> batate hain kyunki kuch badalte nahi, isliye saaf dry run saabit nahi karta ki har command accept hogi. Woh faisla asli device karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Check mode device ko kabhi nahi badalta, par login karke padhta zaroor hai. <code>--diff</code> lines dikhata hai; uske bina sirf <i>changed</i> dikhta hai. Idempotent matlab doosra run <code>changed=0</code> batata hai.</p></div>

<div class="scn"><h4>Diff jisne change roka</h4><p>Ek engineer ne EOS pair ke liye NTP change taiyar kiya aur ticket ke mutabik <code>--check --diff</code> chalaya. Diff mein ek extra line thi jo woh expect nahi kar rahi thi: playbook ek logging host jodne wali thi jo pehle ek colleague ne jaan boojhkar hataya tha. Usne review mein yeh uthaya, line shared variables se nikal di gayi, aur change sirf NTP line ke saath hua.</p><p><b>Lesson:</b> diff hi implementation plan hai. Use reviewer ki tarah padho.</p></div>
<div class="iv"><p class="q">"Idempotent ka kya matlab hai, aur Ansible mein ise kaise saabit karte ho?"</p><p>Wahi playbook do baar chalane par state wahi rehti hai, aur doosra run kuch nahi badalta. Main use dobara chalakar har host ke liye <code>changed=0</code> check karta hoon. Pehle run se pehle <code>--check --diff</code> ko review ke saboot ki tarah use karta hoon.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li><code>--check</code> badlaav ki prediction deta hai bina banaye; <code>--diff</code> lines print karta hai.</li>
<li>Har vendor apne safe tareeke se dry-run karta hai: Junos compare, EOS session diff, IOS XE predicted config.</li>
<li>Doosra run <code>changed=0</code> kahe; wahi saboot aur drift detector hai.</li>
<li>Canary ke liye <code>-l</code>, scope ke liye <code>--list-hosts</code>, parse ke liye <code>--syntax-check</code>.</li>
<li>Junos commits par ticket number ke saath comment likho.</li></ul></div>
`}};export{e as default};