var e={id:`onboarding-fortigate-side`,h:{en:`Onboarding from the FortiGate side`,hi:`FortiGate side se onboarding`},body:{en:`
<p>When you join a new company, you first walk to the reception and say "I am here". Reception does not let you into the offices yet; it notes your name and waits for a manager to say "yes, this person belongs here". Onboarding a FortiGate from its own side works the same way: the FortiGate announces itself, FortiManager lists it as waiting, and an administrator decides.</p>

<h3>Step 1: tell the FortiGate where the FortiManager is</h3>
<p>On the FortiGate, the section <code>config system central-management</code> controls who may manage it. Two settings matter. <code>type</code> says which manager is used, and <code>fmg</code> holds the address of the FortiManager. The default type is <code>fortiguard</code>, which means the FortiGate talks only to the vendor's cloud service. You must change it to <code>fortimanager</code>, otherwise the <code>fmg</code> address is ignored.</p>
<pre class="code"><span class="c">! on HQ-FGT</span>
config system central-management
    set type fortimanager
    set fmg "192.0.2.5"
end</pre>
<p>After this, HQ-FGT opens an FGFM connection (TCP 541) to 192.0.2.5. This needs a working route and a network path between the two addresses; on the lab the management network 192.0.2.0/24 provides it.</p>

<h3>Step 2: find the device in the unauthorized list</h3>
<p>A FortiManager does not trust every device that calls it. A device that connects but is not in the device database is called <b>unauthorized</b>. In the real product you see it in the GUI under Device Manager. The simulator prints it with an <code>execute fmgui</code> command.</p>
<pre class="out">FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME        SERIAL            IP          VERSION
<span class="hl">HQ-FGT      FGVMEV1RGF38I000  192.0.2.11  7.6 MR0</span></pre>
<p>Read three things here: the name, the serial number (this identifies the device) and the version (this must match an ADOM).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Onboarding steps">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 central-</text><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">management</text>
<rect x="175" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 unauthorized</text><text x="245" y="88" text-anchor="middle" class="svg-ink" font-size="13">list</text>
<rect x="340" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 authorize</text><text x="410" y="88" text-anchor="middle" class="svg-muted" font-size="12">revision 1</text>
<rect x="500" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 import</text><text x="565" y="88" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<line x1="150" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/><line x1="315" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="480" y1="75" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The FortiGate-side onboarding path in four steps.</p></div>

<h3>Step 3: authorize into an ADOM</h3>
<p>To <b>authorize</b> means to accept the device into the device database and place it in an ADOM. The ADOM must exist first, and its version must equal the device firmware. In the real product this is a GUI wizard; the simulator command is <code>execute fmgui authorize HQ-FGT Kaveri</code>. FortiManager then <b>retrieves</b> the FortiGate configuration, that is, copies it into its own database, and stores it as <b>revision 1</b>.</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
ADOM 'Kaveri' does not exist.        <span class="c">(before the ADOM was created)</span>

FMG-1 # execute fmgui authorize HQ-FGT Kaveri
<span class="hl">Device HQ-FGT (FGVMEV1RGF38I000) authorized in ADOM Kaveri.</span>
Configuration retrieved: revision 1 created.</pre>

<h3>Step 4: import the policy</h3>
<p>Retrieving gives FortiManager a copy of the device configuration, but the policy database is still empty. To make FortiManager the owner of the existing firewall rules, you <b>import</b> them into a policy package. Without this step, the first install could replace the device's policy table with an empty one. Import is the safe bridge from "the device had its own rules" to "FortiManager knows them".</p>
<pre class="out">FMG-1 # execute fmgui import-policy Kaveri HQ-FGT HQ-Imported
Import finished: policy package HQ-Imported created in ADOM Kaveri with 1 policies and 0 address objects (installation target HQ-FGT).

FMG-1 # diagnose dvm device list
...  HQ-FGT  Kaveri
   |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up
   |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[imported]HQ-Imported</span></pre>
<p>Before the import the pkg field reads <code>pkg:[unknown]null</code>. After it, the word in brackets is <code>imported</code>.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT has one firewall policy that lets the LAN 10.10.0.0/24 reach the internet. After authorize, FMG-1 holds a copy of the device (revision 1). After import-policy, that policy is also part of the package HQ-Imported, and the package targets HQ-FGT.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Leaving the type at fortiguard; typing the FortiManager address wrong; trying to authorize before creating the ADOM; creating the ADOM with another version than the device firmware; and installing before importing. Also remember that authorize, import-policy and install are GUI or API actions in the real product, and exist as <code>execute fmgui</code> only in this simulator.</p></div>

<div class="exam"><p><b>Exam traps.</b> The unauthorized list shows devices that are connected, not managed. Authorize creates revision 1 by retrieving the configuration. Import does not change the device; it only fills the policy database. In the real product you can also use a model device that is added before the FortiGate exists; the simulator does not offer that path.</p></div>

<div class="scn"><h4>The branch that was connected and still invisible</h4><p>The Kaveri network team pointed HQ-FGT at FMG-1 and then searched the device list for an hour. The device was not in the list, but it was in the unauthorized list. They authorized it into the ADOM Kaveri, saw revision 1 appear in the history and then ran an import.</p><p><b>Lesson:</b> look in the unauthorized list before you suspect the network.</p></div>

<div class="iv"><p class="q">"Walk me through onboarding a FortiGate that calls in to FortiManager."</p><p>Set central-management type fortimanager and the FortiManager address on the FortiGate; confirm it appears as unauthorized; make sure the ADOM exists with the same version as the firmware; authorize it, which retrieves revision 1; then import its policy into a package before you ever install.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>central-management needs type fortimanager and the fmg address.</li>
<li>A connected device that is not in the device database is unauthorized.</li>
<li>Authorize needs an existing ADOM with a matching version and creates revision 1.</li>
<li>Import-policy fills a package from the device before any install.</li>
<li>The diagnose dvm device list pkg field shows imported afterwards.</li>
</ul></div>
`,hi:`
<p>Nayi company join karte ho to pehle reception par jaake kehte ho "Main aa gaya hoon". Reception tumhe offices mein nahi jaane deta; wo tumhara naam likhta hai aur manager ke "haan, ye banda yahin ka hai" kehne ka wait karta hai. FortiGate ko apni taraf se onboard karna bhi aisa hi hai: FortiGate khud ko announce karta hai, FortiManager use waiting ki tarah list karta hai, aur administrator decide karta hai.</p>

<h3>Step 1: FortiGate ko batao FortiManager kahan hai</h3>
<p>FortiGate par section <code>config system central-management</code> control karta hai ki use kaun manage kar sakta hai. Do settings zaroori hain. <code>type</code> batata hai kaun sa manager use hoga, aur <code>fmg</code> mein FortiManager ka address hota hai. Default type <code>fortiguard</code> hai, matlab FortiGate sirf vendor ki cloud service se baat karta hai. Use <code>fortimanager</code> karna padta hai, warna <code>fmg</code> address ignore ho jata hai.</p>
<pre class="code"><span class="c">! on HQ-FGT</span>
config system central-management
    set type fortimanager
    set fmg "192.0.2.5"
end</pre>
<p>Iske baad HQ-FGT 192.0.2.5 par FGFM connection (TCP 541) kholta hai. Iske liye route aur dono addresses ke beech working network path chahiye; lab mein management network 192.0.2.0/24 ye deta hai.</p>

<h3>Step 2: unauthorized list mein device dhoondho</h3>
<p>FortiManager har call karne wale device par trust nahi karta. Jo device connect karta hai par device database mein nahi hai, usse <b>unauthorized</b> kehte hain. Real product mein ise GUI mein Device Manager ke andar dekhte ho. Simulator ise <code>execute fmgui</code> command se print karta hai.</p>
<pre class="out">FMG-1 # execute fmgui unauthorized list
Unauthorized devices (connected through FGFM, waiting to be authorized):
NAME        SERIAL            IP          VERSION
<span class="hl">HQ-FGT      FGVMEV1RGF38I000  192.0.2.11  7.6 MR0</span></pre>
<p>Yahan teen cheezein padho: name, serial number (ye device ko identify karta hai) aur version (ye ADOM se match hona chahiye).</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Onboarding steps">
<rect x="10" y="40" width="140" height="70" rx="8" fill="#bae6fd"/><text x="80" y="70" text-anchor="middle" class="svg-ink" font-size="13">1 central-</text><text x="80" y="88" text-anchor="middle" class="svg-ink" font-size="13">management</text>
<rect x="175" y="40" width="140" height="70" rx="8" fill="#fde68a"/><text x="245" y="70" text-anchor="middle" class="svg-ink" font-size="13">2 unauthorized</text><text x="245" y="88" text-anchor="middle" class="svg-ink" font-size="13">list</text>
<rect x="340" y="40" width="140" height="70" rx="8" fill="#bbf7d0"/><text x="410" y="70" text-anchor="middle" class="svg-ink" font-size="13">3 authorize</text><text x="410" y="88" text-anchor="middle" class="svg-muted" font-size="12">revision 1</text>
<rect x="500" y="40" width="130" height="70" rx="8" fill="#ddd6fe"/><text x="565" y="70" text-anchor="middle" class="svg-ink" font-size="13">4 import</text><text x="565" y="88" text-anchor="middle" class="svg-muted" font-size="12">policy</text>
<line x1="150" y1="75" x2="175" y2="75" stroke="#64748b" stroke-width="2"/><line x1="315" y1="75" x2="340" y2="75" stroke="#64748b" stroke-width="2"/><line x1="480" y1="75" x2="500" y2="75" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">FortiGate-side onboarding ka path, chaar steps mein.</p></div>

<h3>Step 3: ADOM mein authorize karo</h3>
<p><b>Authorize</b> ka matlab device ko device database mein accept karna aur ek ADOM mein rakhna. ADOM pehle se exist karna chahiye, aur uska version device firmware ke barabar hona chahiye. Real product mein ye GUI wizard hai; simulator command hai <code>execute fmgui authorize HQ-FGT Kaveri</code>. Phir FortiManager FortiGate ki configuration <b>retrieve</b> karta hai, yaani apne database mein copy karta hai, aur use <b>revision 1</b> ki tarah store karta hai.</p>
<pre class="out">FMG-1 # execute fmgui authorize HQ-FGT Kaveri
ADOM 'Kaveri' does not exist.        <span class="c">(ADOM banane se pehle)</span>

FMG-1 # execute fmgui authorize HQ-FGT Kaveri
<span class="hl">Device HQ-FGT (FGVMEV1RGF38I000) authorized in ADOM Kaveri.</span>
Configuration retrieved: revision 1 created.</pre>

<h3>Step 4: policy import karo</h3>
<p>Retrieve se FortiManager ko device configuration ki copy milti hai, par policy database abhi khaali hai. Existing firewall rules ka owner FortiManager banane ke liye unhe ek policy package mein <b>import</b> karte ho. Is step ke bina pehla install device ki policy table ko khaali table se replace kar sakta hai. Import "device ke apne rules the" se "FortiManager unhe jaanta hai" tak ka safe bridge hai.</p>
<pre class="out">FMG-1 # execute fmgui import-policy Kaveri HQ-FGT HQ-Imported
Import finished: policy package HQ-Imported created in ADOM Kaveri with 1 policies and 0 address objects (installation target HQ-FGT).

FMG-1 # diagnose dvm device list
...  HQ-FGT  Kaveri
   |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: retrieved; conn: up
   |- vdom:[3]root flags:0 adom:Kaveri <span class="hl">pkg:[imported]HQ-Imported</span></pre>
<p>Import se pehle pkg field <code>pkg:[unknown]null</code> padhta hai. Uske baad brackets ka word <code>imported</code> hota hai.</p>

<div class="eg"><p><b>Worked example.</b> HQ-FGT ki ek firewall policy hai jo LAN 10.10.0.0/24 ko internet tak jaane deti hai. Authorize ke baad FMG-1 ke paas device ki copy hai (revision 1). Import-policy ke baad wahi policy package HQ-Imported ka hissa hai, aur package ka target HQ-FGT hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Type ko fortiguard chhod dena; FortiManager address galat type karna; ADOM banane se pehle authorize karne ki koshish; ADOM ko device firmware se alag version ke saath banana; aur import se pehle install karna. Ye bhi yaad rakho ki authorize, import-policy aur install real product mein GUI ya API actions hain, aur <code>execute fmgui</code> sirf is simulator mein hai.</p></div>

<div class="exam"><p><b>Exam traps.</b> Unauthorized list connected devices dikhati hai, managed nahi. Authorize configuration retrieve karke revision 1 banata hai. Import device ko nahi badalta; wo sirf policy database bharta hai. Real product mein model device bhi use kar sakte ho jo FortiGate ke exist karne se pehle add hota hai; simulator ye path nahi deta.</p></div>

<div class="scn"><h4>Wo branch jo connected tha par invisible</h4><p>Kaveri network team ne HQ-FGT ko FMG-1 par point kiya aur ek ghante tak device list mein dhoondhte rahe. Device list mein nahi tha, par unauthorized list mein tha. Unhone use ADOM Kaveri mein authorize kiya, history mein revision 1 aaya dekha aur phir import chalaya.</p><p><b>Lesson:</b> network par shak karne se pehle unauthorized list dekho.</p></div>

<div class="iv"><p class="q">"Mujhe batao jo FortiGate FortiManager ko call karta hai use kaise onboard karte hain."</p><p>FortiGate par central-management type fortimanager aur FortiManager address set karo; confirm karo ki wo unauthorized dikhta hai; ADOM exist kare aur uska version firmware ke barabar ho; use authorize karo, jo revision 1 retrieve karta hai; phir install se pehle uski policy ek package mein import karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>central-management ko type fortimanager aur fmg address chahiye.</li>
<li>Connected device jo device database mein nahi hai wo unauthorized hai.</li>
<li>Authorize ko matching version wala existing ADOM chahiye aur wo revision 1 banata hai.</li>
<li>Import-policy install se pehle device se package bharta hai.</li>
<li>diagnose dvm device list ka pkg field baad mein imported dikhata hai.</li>
</ul></div>
`}};export{e as default};