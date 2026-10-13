var e={id:`reading-config-status`,h:{en:`Reading the config status: dev-db, conf, cond, dm, conn and pkg`,hi:`Config status padhna: dev-db, conf, cond, dm, conn aur pkg`},body:{en:`
<p>A hospital bed has a chart at its foot: temperature, pulse, last medicine, next check. A nurse reads it in seconds and knows whether to worry. The STATUS line of <code>diagnose dvm device list</code> is that chart for a FortiGate. It has five short fields, then a sixth, the package field, one line below. Once you can read them, you can say what is wrong with a device without logging in to it.</p>

<h3>The six fields</h3>
<table class="cmp"><tr><th>Field</th><th>Values</th><th>Question it answers</th></tr>
<tr><td>conn</td><td>up, down</td><td>Is the FGFM tunnel alive right now?</td></tr>
<tr><td>conf</td><td>in sync, out of sync</td><td>Does the FortiGate still match FortiManager's last copy?</td></tr>
<tr><td>dev-db</td><td>not modified, modified</td><td>Are changes waiting inside FortiManager (for example a template)?</td></tr>
<tr><td>cond</td><td>OK, pending, unknown</td><td>The summary: all fine, changes waiting, or cannot tell</td></tr>
<tr><td>dm</td><td>retrieved, installed, autoupdated</td><td>What was the last thing FortiManager did to this device?</td></tr>
<tr><td>pkg</td><td>never-installed, imported, installed, modified, unknown</td><td>What is the state of the policy package?</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Reading order of the status fields">
<rect x="10" y="20" width="95" height="60" rx="8" fill="#fed7aa"/><text x="57" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 conn</text><text x="57" y="66" text-anchor="middle" class="svg-muted" font-size="11">tunnel?</text>
<rect x="115" y="20" width="95" height="60" rx="8" fill="#fde68a"/><text x="162" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 conf</text><text x="162" y="66" text-anchor="middle" class="svg-muted" font-size="11">same copy?</text>
<rect x="220" y="20" width="95" height="60" rx="8" fill="#bae6fd"/><text x="267" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 dev-db</text><text x="267" y="66" text-anchor="middle" class="svg-muted" font-size="11">waiting?</text>
<rect x="325" y="20" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="372" y="48" text-anchor="middle" class="svg-ink" font-size="13">4 pkg</text><text x="372" y="66" text-anchor="middle" class="svg-muted" font-size="11">package?</text>
<rect x="430" y="20" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="477" y="48" text-anchor="middle" class="svg-ink" font-size="13">5 dm</text><text x="477" y="66" text-anchor="middle" class="svg-muted" font-size="11">last action</text>
<rect x="535" y="20" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="582" y="48" text-anchor="middle" class="svg-ink" font-size="13">cond</text><text x="582" y="66" text-anchor="middle" class="svg-muted" font-size="11">summary</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Read left to right. A bad conn explains most of the others.</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">cond is computed from the rest, so read it last.</text>
</svg><p class="cap">A practical reading order for the status line.</p></div>

<h3>A healthy device and a broken one</h3>
<p>This is the real output of the lab fm-devstatus for a healthy device and for the unreachable MDU-FGT:</p>
<pre class="out">HQ-FGT   |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up; source: FMG
         |- vdom:[3]root flags:0 adom:Kaveri pkg:[unknown]null

MDU-FGT  (IP column shows -)
         |- STATUS: dev-db: not modified; <span class="hl">conf: out of sync; cond: unknown; dm: unknown; conn: down</span>; source: FMG
         |- vdom:[3]root flags:0 adom:Kaveri pkg:[never-installed]null</pre>
<p>Read MDU-FGT from the left. conn down: the tunnel is gone. Because FortiManager cannot look, conf says out of sync and cond says unknown. The tunnel is the cause, the rest are consequences. A try to install now would fail with exactly that reason:</p>
<pre class="out">FMG-1 # execute fmgui install-device Kaveri MDU-FGT
Install failed: the FGFM tunnel to MDU-FGT is down (device status: connection down).</pre>
<p>On the FortiGate the cause is visible too: <code>show system central-management</code> printed an empty section, so the type and the fmg address were missing (the default type is fortiguard, as you learned in fmg-start).</p>

<h3>Changes waiting: dev-db modified</h3>
<p>In the same lab TRY-FGT has a system template assigned that has never been installed. FortiManager owns a change that the FortiGate does not have yet; the field dev-db says modified and cond says pending. <code>install-preview</code> shows exactly what would be sent, and sends nothing:</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (5 CLI lines, nothing is sent to the device):
  config system dns
  set primary 192.0.2.53
  set secondary 192.0.2.54
  set domain "kaveri.example"
  end</pre>
<p>After <code>install-device</code> the status changes to dev-db not modified, and dm shows <span class="hl">installed</span>. The revision list of TRY-FGT then holds two entries, 1 retrieve and 2 install. A third value of dm, autoupdated, appears when a local change was taken over; module fmg-revisions explains it.</p>

<div class="eg"><p><b>Worked example.</b> The NOC says two devices have problems. Reading the list: HQ-FGT is all green. MDU-FGT has conn down, so it is unreachable; the fix is on the FortiGate (central management). TRY-FGT has changes waiting; the fix is on FortiManager (install). Two devices, two different sides, found without opening a single console.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reading conf out of sync as "somebody changed the device" when conn is down: an unreachable device is always out of sync. Treating pending as an error: it only means that something is waiting to be installed. Installing before reading the preview.</p></div>

<div class="exam"><p><b>Exam traps.</b> dev-db modified means changes inside FortiManager are not installed; conf out of sync means the FortiGate differs from FortiManager's copy or is unreachable. They are opposite directions. The pkg field is on the second line, not in the STATUS line. Output layouts here are approximations of the real product.</p></div>

<div class="scn"><h4>The dashboard that was all amber</h4><p>On Monday morning the Kaveri NOC saw amber on two devices and called it a network outage. The engineer ran the device list and read it in order. One device had conn down after a power cut at the branch; the other only had pending template changes from Friday. Only the first needed a site call. The second was installed after a preview in two minutes.</p><p><b>Lesson:</b> read conn first; different colours mean different owners of the fix.</p></div>

<div class="iv"><p class="q">"In diagnose dvm device list a device shows conf out of sync. What do you do?"</p><p>First look at conn. If it is down, the device is unreachable, so work on the FGFM tunnel. If conn is up, someone changed the FortiGate directly; compare the revisions and decide whether to import the change. Do not install blindly.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>conn is the tunnel; conf compares the device with FortiManager's last copy.</li>
<li>dev-db modified means changes are waiting inside FortiManager; cond pending says the same in summary.</li>
<li>dm tells the last action: retrieved, installed or autoupdated.</li>
<li>pkg shows unknown, never-installed, imported, installed or modified.</li>
<li>Read conn first; a down tunnel explains out of sync and unknown.</li>
</ul></div>
`,hi:`
<p>Hospital ke bed ke paas ek chart hota hai: temperature, pulse, last medicine, next check. Nurse seconds mein padhkar jaan leti hai ki chinta karni hai ya nahi. <code>diagnose dvm device list</code> ki STATUS line FortiGate ka wahi chart hai. Isme paanch chhote fields hain, aur chhatha, package field, ek line neeche. Inhe padhna aa jaye to aap device mein login kiye bina bata sakte ho ki kya galat hai.</p>

<h3>Chhe fields</h3>
<table class="cmp"><tr><th>Field</th><th>Values</th><th>Kaun sa sawaal batata hai</th></tr>
<tr><td>conn</td><td>up, down</td><td>FGFM tunnel abhi zinda hai?</td></tr>
<tr><td>conf</td><td>in sync, out of sync</td><td>FortiGate abhi bhi FortiManager ki last copy se match karta hai?</td></tr>
<tr><td>dev-db</td><td>not modified, modified</td><td>FortiManager ke andar changes wait kar rahe hain (jaise template)?</td></tr>
<tr><td>cond</td><td>OK, pending, unknown</td><td>Summary: sab theek, changes waiting, ya pata nahi</td></tr>
<tr><td>dm</td><td>retrieved, installed, autoupdated</td><td>FortiManager ne is device par aakhri kaam kya kiya?</td></tr>
<tr><td>pkg</td><td>never-installed, imported, installed, modified, unknown</td><td>Policy package ki state kya hai?</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Status fields padhne ka order">
<rect x="10" y="20" width="95" height="60" rx="8" fill="#fed7aa"/><text x="57" y="48" text-anchor="middle" class="svg-ink" font-size="13">1 conn</text><text x="57" y="66" text-anchor="middle" class="svg-muted" font-size="11">tunnel?</text>
<rect x="115" y="20" width="95" height="60" rx="8" fill="#fde68a"/><text x="162" y="48" text-anchor="middle" class="svg-ink" font-size="13">2 conf</text><text x="162" y="66" text-anchor="middle" class="svg-muted" font-size="11">same copy?</text>
<rect x="220" y="20" width="95" height="60" rx="8" fill="#bae6fd"/><text x="267" y="48" text-anchor="middle" class="svg-ink" font-size="13">3 dev-db</text><text x="267" y="66" text-anchor="middle" class="svg-muted" font-size="11">waiting?</text>
<rect x="325" y="20" width="95" height="60" rx="8" fill="#ddd6fe"/><text x="372" y="48" text-anchor="middle" class="svg-ink" font-size="13">4 pkg</text><text x="372" y="66" text-anchor="middle" class="svg-muted" font-size="11">package?</text>
<rect x="430" y="20" width="95" height="60" rx="8" fill="#bbf7d0"/><text x="477" y="48" text-anchor="middle" class="svg-ink" font-size="13">5 dm</text><text x="477" y="66" text-anchor="middle" class="svg-muted" font-size="11">last action</text>
<rect x="535" y="20" width="95" height="60" rx="8" fill="#e2e8f0"/><text x="582" y="48" text-anchor="middle" class="svg-ink" font-size="13">cond</text><text x="582" y="66" text-anchor="middle" class="svg-muted" font-size="11">summary</text>
<text x="320" y="125" text-anchor="middle" class="svg-muted" font-size="12">Left se right padho. Kharab conn baaki ko samjha deta hai.</text>
<text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="12">cond baaki se banta hai, isliye use aakhir mein padho.</text>
</svg><p class="cap">Status line padhne ka practical order.</p></div>

<h3>Healthy device aur toota hua device</h3>
<p>Ye lab fm-devstatus ka real output hai, healthy device aur unreachable MDU-FGT ke liye:</p>
<pre class="out">HQ-FGT   |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up; source: FMG
         |- vdom:[3]root flags:0 adom:Kaveri pkg:[unknown]null

MDU-FGT  (IP column mein - dikhta hai)
         |- STATUS: dev-db: not modified; <span class="hl">conf: out of sync; cond: unknown; dm: unknown; conn: down</span>; source: FMG
         |- vdom:[3]root flags:0 adom:Kaveri pkg:[never-installed]null</pre>
<p>MDU-FGT ko left se padho. conn down: tunnel nahi hai. FortiManager dekh nahi sakta, isliye conf out of sync aur cond unknown kehta hai. Tunnel cause hai, baaki consequences. Ab install try karoge to bilkul wahi wajah milegi:</p>
<pre class="out">FMG-1 # execute fmgui install-device Kaveri MDU-FGT
Install failed: the FGFM tunnel to MDU-FGT is down (device status: connection down).</pre>
<p>FortiGate par bhi wajah dikhti hai: <code>show system central-management</code> ne khaali section print kiya, yaani type aur fmg address missing the (default type fortiguard hai, jaisa fmg-start mein seekha).</p>

<h3>Changes waiting: dev-db modified</h3>
<p>Isi lab mein TRY-FGT par ek system template assigned hai jo kabhi install nahi hua. FortiManager ke paas ek change hai jo FortiGate ke paas abhi nahi hai; dev-db field modified kehta hai aur cond pending. <code>install-preview</code> theek wahi dikhata hai jo bheja jayega, aur kuch bhejta nahi:</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (5 CLI lines, nothing is sent to the device):
  config system dns
  set primary 192.0.2.53
  set secondary 192.0.2.54
  set domain "kaveri.example"
  end</pre>
<p><code>install-device</code> ke baad status dev-db not modified ho jata hai, aur dm <span class="hl">installed</span> dikhata hai. TRY-FGT ki revision list mein phir do entries hoti hain, 1 retrieve aur 2 install. dm ki teesri value, autoupdated, tab aati hai jab local change FortiManager ne apne haath mein le liya; module fmg-revisions use samjhata hai.</p>

<div class="eg"><p><b>Worked example.</b> NOC kehta hai do devices mein problem hai. List padhi: HQ-FGT sab green. MDU-FGT mein conn down hai, yaani unreachable; fix FortiGate par hai (central management). TRY-FGT ke changes waiting hain; fix FortiManager par hai (install). Do devices, do alag sides, ek bhi console khole bina mil gaye.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Conn down hone par conf out of sync ko "kisi ne device badla" padhna: unreachable device hamesha out of sync hota hai. Pending ko error samajhna: iska matlab sirf itna hai ki kuch install hone ka intezaar kar raha hai. Preview padhe bina install karna.</p></div>

<div class="exam"><p><b>Exam traps.</b> dev-db modified ka matlab FortiManager ke andar changes install nahi hue; conf out of sync ka matlab FortiGate FortiManager ki copy se alag hai ya unreachable hai. Dono ki direction ulti hai. pkg field doosri line mein hai, STATUS line mein nahi. Yahan output layouts real product ke approximations hain.</p></div>

<div class="scn"><h4>Dashboard jo poora amber tha</h4><p>Monday subah Kaveri NOC ne do devices par amber dekha aur ise network outage bola. Engineer ne device list chalayi aur order mein padhi. Ek device ka branch mein power cut ke baad conn down tha; doosre mein sirf Friday ke pending template changes the. Sirf pehle ke liye site call chahiye thi. Doosra preview ke baad do minute mein install ho gaya.</p><p><b>Lesson:</b> conn pehle padho; alag rang ka matlab fix ka malik alag.</p></div>

<div class="iv"><p class="q">"Diagnose dvm device list mein device conf out of sync dikhata hai. Kya karoge?"</p><p>Pehle conn dekho. Down hai to device unreachable hai, isliye FGFM tunnel par kaam karo. Conn up hai to kisi ne FortiGate seedha badla hai; revisions compare karo aur decide karo ki change import karna hai ya nahi. Andhadhundh install mat karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>conn tunnel hai; conf device ko FortiManager ki last copy se compare karta hai.</li>
<li>dev-db modified ka matlab FortiManager ke andar changes wait kar rahe hain; cond pending summary mein wahi kehta hai.</li>
<li>dm aakhri action batata hai: retrieved, installed ya autoupdated.</li>
<li>pkg unknown, never-installed, imported, installed ya modified dikhata hai.</li>
<li>Conn pehle padho; down tunnel out of sync aur unknown ko samjha deta hai.</li>
</ul></div>
`}};export{e as default};