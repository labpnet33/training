var e={id:`running-recap`,h:{en:`Running a playbook: options and the PLAY RECAP`,hi:`Playbook chalana: options aur PLAY RECAP`},body:{en:`

<p><b>One idea in this chapter:</b> the output of a playbook is a report, and learning to read it takes two minutes. Every task prints one result per device; the PLAY RECAP at the end adds them up.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="ansible-playbook reads the files, runs each task on each host, and sums the results in the PLAY RECAP."><rect x="10" y="28" width="182" height="68" rx="10" fill="#bae6fd"/><text x="101" y="58" text-anchor="middle" class="svg-ink" font-size="14">Read files</text><text x="101" y="78" text-anchor="middle" class="svg-muted" font-size="12">inventory + playbook</text><line x1="192" y1="62" x2="222" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="222,57 228,62 222,67" fill="#64748b"/><text x="210" y="50" text-anchor="middle" class="svg-accent" font-size="11">SSH</text><rect x="228" y="28" width="182" height="68" rx="10" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="14">Per task, per host</text><text x="319" y="78" text-anchor="middle" class="svg-muted" font-size="12">compare + act</text><line x1="410" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="440,57 446,62 440,67" fill="#64748b"/><text x="428" y="50" text-anchor="middle" class="svg-accent" font-size="11">result</text><rect x="446" y="28" width="182" height="68" rx="10" fill="#fde68a"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="14">PLAY RECAP</text><text x="537" y="78" text-anchor="middle" class="svg-muted" font-size="12">ok / changed / failed</text></svg><p class="cap">ansible-playbook reads the files, runs each task on each host, and sums the results in the PLAY RECAP.</p></div>

<h3>The command and its options</h3>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml                  <span class="c"># run for real</span>
ansible-playbook -i inventory.ini ntp.yml --syntax-check   <span class="c"># only check the YAML</span>
ansible-playbook -i inventory.ini ntp.yml --list-hosts     <span class="c"># which devices would be used</span>
ansible-playbook -i inventory.ini ntp.yml --list-tasks     <span class="c"># which tasks would run</span>
ansible-playbook -i inventory.ini ntp.yml -l R1            <span class="c"># limit to one host</span>
ansible-playbook -i inventory.ini ntp.yml -v               <span class="c"># more detail (-vv, -vvv: even more)</span>
ansible-playbook -i inventory.ini ntp.yml --check          <span class="c"># dry run (next chapter)</span></pre>
<p>The command is <code>ansible-playbook</code>, <code>-i</code> names the inventory file, and then comes the playbook file. Everything after that is an option. The ones in the list are the ones the lab uses; each runs without changing anything except the real run and <code>-l</code>.</p>

<h3>Safe questions before the real run</h3>
<p>Get used to asking Ansible what it <i>would</i> do. First, the syntax check, which loads the file and verifies that it is valid YAML and that the module names exist:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --syntax-check</pre>
<pre class="out">playbook: ntp.yml</pre>
<p>A single line that echoes the playbook name means the file loaded correctly. Next, which devices will be touched:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --list-hosts</pre>
<pre class="out">playbook: ntp.yml

  play #1 (routers): Standard time and logging	TAGS: []
    pattern: ['routers']
    hosts (2):
      R1
      R2</pre>
<p>This shows the group pattern and the exact hosts matched. If you expected 200 routers and see 2, you have found a mistake without touching any device. And which tasks:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --list-tasks</pre>
<pre class="out">playbook: ntp.yml

  play #1 (routers): Standard time and logging	TAGS: []
    tasks:
      Point NTP and syslog at the NOC server	TAGS: []</pre>

<h3>A real run, read line by line</h3>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml</pre>
<pre class="out">PLAY [Standard time and logging] **********************************************

TASK [Point NTP and syslog at the NOC server] *********************************
<span class="hl">changed: [R1</span>]
<span class="hl">changed: [R2</span>]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>The first run changed both routers. The result words are:</p>
<table class="cmp"><tr><th>Word</th><th>Meaning</th><th>Action</th></tr><tr><td>ok</td><td>the task ran and nothing needed to change</td><td>good</td></tr><tr><td>changed</td><td>Ansible changed the device (or, in check mode, would change it)</td><td>expected on a first run</td></tr><tr><td>skipped</td><td>the task was not applicable (a condition said no)</td><td>usually fine</td></tr><tr><td>failed / FAILED!</td><td>the task ran and an error occurred</td><td>read the message</td></tr><tr><td>unreachable / UNREACHABLE!</td><td>could not connect at all</td><td>check address, route, SSH</td></tr></table>
<p>The <b>PLAY RECAP</b> gives one line per host with counters. <code>ok=1</code> counts every task that did not fail (<code>changed</code> tasks are included in ok). Read it from the right: <code>failed=0</code> and <code>unreachable=0</code> must be zero for a healthy run. If any host has failed or unreachable above zero, that host needs attention, and the other hosts are still done.</p>

<h3>Limiting to one device: -l</h3>
<p>For a pilot, run on one host first. <code>-l R1</code> (also <code>--limit</code>) restricts the run to hosts that match:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml -l R1</pre>
<pre class="out">PLAY [Standard time and logging] **********************************************

TASK [Point NTP and syslog at the NOC server] *********************************
changed: [R1]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Only R1 appears. If it works, drop the <code>-l</code> and let the rest follow. This is a cheap form of staged rollout.</p>

<h3>More detail with -v</h3>
<p>Plain output shows only the result word. Add <code>-v</code> and the result of each task is printed in full:</p>
<pre class="out">TASK [Point NTP and syslog at the NOC server] *********************************
ok: [R1] =&gt; {"changed": false, "commands": [], "updates": []}</pre>
<p>(This is R1 on a later run, when nothing was left to change, so <code>commands</code> is empty.) When a task changes the device, the <code>updates</code> list shows the exact configuration lines that were sent. Use <code>-v</code> when you want to see what Ansible actually did.</p>

<h3>Habits for every run</h3>
<ul><li><code>--syntax-check</code> first, then <code>--list-hosts</code> to confirm the target list.</li><li>Read the PLAY RECAP, not just the last line of the output. Zeros in failed and unreachable are the goal.</li><li>Save the output with the change record. It is your evidence of what ran and what changed.</li><li>Pilot with <code>-l</code> on one device before a wide run.</li></ul>

<div class="eg"><p><b>Worked example.</b> You add a new playbook and run --syntax-check (clean), then --list-hosts. It shows hosts (2): R1 and R2, exactly what you expected. You run it with -l R1 as a pilot, check that R1 is correct, and then run it for everybody. The final recap shows failed=0 unreachable=0 on both lines.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Reading only the final line and missing a failed host higher up. Running a playbook against all hosts without checking the target list. Forgetting -i and so using the wrong default inventory. Treating changed=1 as a problem on the first run; it is the expected result.</p></div>
<div class="exam"><p><b>Exam trap.</b> changed means Ansible modified the device (or would, in check mode). ok means the state already matched. The recap counts per host. A host can be unreachable while the others succeed.</p></div>

<div class="scn"><h4>The recap that told the truth</h4><p>A team ran a nightly playbook across 80 switches. The log was long and nobody read it, until one morning an engineer looked at the PLAY RECAP only. Three switches showed unreachable=1 and one showed failed=1. A single glance found a dead uplink and a disk-full switch that a ping monitor had missed. After that the recap was copied into the team chat after every run.</p><p><b>Lesson:</b> the recap is a health check for the run; read it before anything else.</p></div>
<div class="iv"><p class="q">"What does the PLAY RECAP tell you?"</p><p>For each host it gives counters: ok, changed, unreachable, failed, skipped, rescued and ignored. A healthy run has failed=0 and unreachable=0. Changed shows how many tasks actually modified the device, so a second identical run should show changed=0. I also use --list-hosts and -l to control the target list.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>ansible-playbook -i INVENTORY PLAYBOOK runs it; --syntax-check, --list-hosts and --list-tasks inspect without changing anything.</li><li>Each task prints ok, changed, failed or unreachable per host.</li><li>The PLAY RECAP sums results per host; failed and unreachable should be zero.</li><li>-l limits the run to some hosts; -v shows what each task did.</li><li>Check first, pilot on one device, then run on everyone.</li></ul></div>

`,hi:`

<p><b>Is chapter ki ek idea:</b> playbook ka output ek report hai, aur use padhna do minute mein seekha ja sakta hai. Har task har device ke liye ek result print karta hai; end ka PLAY RECAP sabko jod deta hai.</p>
<div class="dia"><svg viewBox="0 0 640 120" role="img" aria-label="ansible-playbook files padhta hai, har task har host par chalata hai, aur results ko PLAY RECAP mein jodta hai."><rect x="10" y="28" width="182" height="68" rx="10" fill="#bae6fd"/><text x="101" y="58" text-anchor="middle" class="svg-ink" font-size="14">Files padho</text><text x="101" y="78" text-anchor="middle" class="svg-muted" font-size="12">inventory + playbook</text><line x1="192" y1="62" x2="222" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="222,57 228,62 222,67" fill="#64748b"/><text x="210" y="50" text-anchor="middle" class="svg-accent" font-size="11">SSH</text><rect x="228" y="28" width="182" height="68" rx="10" fill="#bbf7d0"/><text x="319" y="58" text-anchor="middle" class="svg-ink" font-size="14">Har task, har host</text><text x="319" y="78" text-anchor="middle" class="svg-muted" font-size="12">compare + action</text><line x1="410" y1="62" x2="440" y2="62" stroke="#64748b" stroke-width="2"/><polygon points="440,57 446,62 440,67" fill="#64748b"/><text x="428" y="50" text-anchor="middle" class="svg-accent" font-size="11">result</text><rect x="446" y="28" width="182" height="68" rx="10" fill="#fde68a"/><text x="537" y="58" text-anchor="middle" class="svg-ink" font-size="14">PLAY RECAP</text><text x="537" y="78" text-anchor="middle" class="svg-muted" font-size="12">ok / changed / failed</text></svg><p class="cap">ansible-playbook reads the files, runs each task on each host, and sums the results in the PLAY RECAP.</p></div>

<h3>Command aur uske options</h3>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml                  <span class="c"># asli run</span>
ansible-playbook -i inventory.ini ntp.yml --syntax-check   <span class="c"># sirf YAML check</span>
ansible-playbook -i inventory.ini ntp.yml --list-hosts     <span class="c"># kaun se devices use honge</span>
ansible-playbook -i inventory.ini ntp.yml --list-tasks     <span class="c"># kaun se tasks chalenge</span>
ansible-playbook -i inventory.ini ntp.yml -l R1            <span class="c"># ek host tak limit</span>
ansible-playbook -i inventory.ini ntp.yml -v               <span class="c"># zyada detail (-vv, -vvv: aur zyada)</span>
ansible-playbook -i inventory.ini ntp.yml --check          <span class="c"># dry run (agla chapter)</span></pre>
<p>Command <code>ansible-playbook</code> hai, <code>-i</code> inventory file ka naam deta hai, phir playbook file aati hai. Uske baad sab options hain. List ke options woh hain jo lab use karta hai; asli run aur <code>-l</code> ke alawa koi bhi kuch nahi badalta.</p>

<h3>Asli run se pehle safe sawaal</h3>
<p>Ansible se poochne ki aadat daalo ki woh <i>kya karega</i>. Pehle syntax check, jo file load karke verify karta hai ki woh valid YAML hai aur module ke naam maujood hain:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --syntax-check</pre>
<pre class="out">playbook: ntp.yml</pre>
<p>Ek line jo playbook ka naam dohrati hai, matlab file sahi load hui. Agla, kaun se devices chhue jaayenge:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --list-hosts</pre>
<pre class="out">playbook: ntp.yml

  play #1 (routers): Standard time and logging	TAGS: []
    pattern: ['routers']
    hosts (2):
      R1
      R2</pre>
<p>Yeh group pattern aur match hue exact hosts dikhata hai. Agar aapne 200 routers expect kiye aur 2 dikhe, to aapne kisi device ko chhue bina galti pakad li. Aur kaun se tasks:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml --list-tasks</pre>
<pre class="out">playbook: ntp.yml

  play #1 (routers): Standard time and logging	TAGS: []
    tasks:
      Point NTP and syslog at the NOC server	TAGS: []</pre>

<h3>Asli run, line by line padho</h3>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml</pre>
<pre class="out">PLAY [Standard time and logging] **********************************************

TASK [Point NTP and syslog at the NOC server] *********************************
<span class="hl">changed: [R1</span>]
<span class="hl">changed: [R2</span>]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   
R2                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Pehle run ne dono routers badle. Result words yeh hain:</p>
<table class="cmp"><tr><th>Word</th><th>Matlab</th><th>Action</th></tr><tr><td>ok</td><td>task chala aur kuch badalne ki zaroorat nahi thi</td><td>achha</td></tr><tr><td>changed</td><td>Ansible ne device badla (ya check mode mein badalta)</td><td>pehle run par expected</td></tr><tr><td>skipped</td><td>task lagoo nahi hua (condition ne mana kiya)</td><td>aam taur par theek</td></tr><tr><td>failed / FAILED!</td><td>task chala aur error aaya</td><td>message padho</td></tr><tr><td>unreachable / UNREACHABLE!</td><td>connect hi nahi hua</td><td>address, route, SSH check karo</td></tr></table>
<p><b>PLAY RECAP</b> har host ke liye counters ke saath ek line deta hai. <code>ok=1</code> har us task ko ginta hai jo fail nahi hua (<code>changed</code> tasks ok mein shamil hain). Ise daayen se padho: healthy run ke liye <code>failed=0</code> aur <code>unreachable=0</code> zero hone chahiye. Agar kisi host par failed ya unreachable zero se upar hai, to us host ko dhyan chahiye, aur baaki hosts phir bhi ho chuke hain.</p>

<h3>Ek device tak limit: -l</h3>
<p>Pilot ke liye pehle ek host par chalao. <code>-l R1</code> (<code>--limit</code> bhi) run ko match hone wale hosts tak seemit karta hai:</p>
<pre class="code">ansible-playbook -i inventory.ini ntp.yml -l R1</pre>
<pre class="out">PLAY [Standard time and logging] **********************************************

TASK [Point NTP and syslog at the NOC server] *********************************
changed: [R1]

PLAY RECAP ********************************************************************
R1                         : ok=1    changed=1    unreachable=0    failed=0    skipped=0    rescued=0    ignored=0   </pre>
<p>Sirf R1 dikhta hai. Agar kaam kare to <code>-l</code> hata do aur baaki ko chalne do. Yeh staged rollout ka sasta roop hai.</p>

<h3>-v se zyada detail</h3>
<p>Plain output sirf result word dikhata hai. <code>-v</code> jodo aur har task ka result poora print hota hai:</p>
<pre class="out">TASK [Point NTP and syslog at the NOC server] *********************************
ok: [R1] =&gt; {"changed": false, "commands": [], "updates": []}</pre>
<p>(Yeh R1 ka baad wala run hai, jab badalne ko kuch nahi bacha tha, isliye <code>commands</code> khaali hai.) Jab task device badalta hai to <code>updates</code> list wahi configuration lines dikhati hai jo bheji gayi. Jab dekhna ho ki Ansible ne asal mein kya kiya, tab <code>-v</code> use karo.</p>

<h3>Har run ki aadatein</h3>
<ul><li>Pehle <code>--syntax-check</code>, phir target list confirm karne ke liye <code>--list-hosts</code>.</li><li>PLAY RECAP padho, sirf output ki aakhri line nahi. failed aur unreachable mein zero hona goal hai.</li><li>Output ko change record ke saath save karo. Yeh aapka saboot hai ki kya chala aur kya badla.</li><li>Wide run se pehle <code>-l</code> se ek device par pilot karo.</li></ul>

<div class="eg"><p><b>Worked example.</b> Aap naya playbook jodte ho aur --syntax-check chalate ho (clean), phir --list-hosts. Yeh hosts (2): R1 aur R2 dikhata hai, bilkul jo aapne expect kiya. Aap pilot ke taur par -l R1 se chalate ho, R1 sahi hai check karte ho, aur phir sabke liye chalate ho. Aakhri recap dono lines par failed=0 unreachable=0 dikhata hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Sirf aakhri line padhna aur upar failed host miss kar dena. Target list check kiye bina saare hosts par playbook chalana. -i bhool jaana aur galat default inventory use karna. Pehle run par changed=1 ko problem samajhna; yeh expected result hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> changed matlab Ansible ne device badla (ya check mode mein badalta). ok matlab state pehle se match thi. Recap per host ginta hai. Ek host unreachable ho sakta hai jabki baaki succeed karein.</p></div>

<div class="scn"><h4>Recap ne sach bataya</h4><p>Ek team 80 switches par nightly playbook chalati thi. Log lamba tha aur koi nahi padhta tha, ek subah ek engineer ne sirf PLAY RECAP dekha. Teen switches par unreachable=1 aur ek par failed=1 tha. Ek hi nazar mein ek dead uplink aur ek disk-full switch mil gaya jo ping monitor se chhoot gaya tha. Uske baad har run ke baad recap team chat mein copy hone laga.</p><p><b>Lesson:</b> recap run ka health check hai; kuch bhi aur padhne se pehle ise padho.</p></div>
<div class="iv"><p class="q">"PLAY RECAP kya batata hai?"</p><p>Har host ke liye counters deta hai: ok, changed, unreachable, failed, skipped, rescued aur ignored. Healthy run mein failed=0 aur unreachable=0 hota hai. Changed batata hai kitne tasks ne asal mein device badla, isliye dobara wahi run karne par changed=0 hona chahiye. Target list control karne ke liye main --list-hosts aur -l bhi use karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul><li>ansible-playbook -i INVENTORY PLAYBOOK chalata hai; --syntax-check, --list-hosts aur --list-tasks bina badle inspect karte hain.</li><li>Har task har host ke liye ok, changed, failed ya unreachable print karta hai.</li><li>PLAY RECAP per host results jodta hai; failed aur unreachable zero hone chahiye.</li><li>-l run ko kuch hosts tak limit karta hai; -v dikhata hai har task ne kya kiya.</li><li>Pehle check, ek device par pilot, phir sabpar chalao.</li></ul></div>

`}};export{e as default};