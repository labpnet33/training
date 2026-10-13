var e={id:`lab-fm-tpl-ts`,h:{en:`Lab fm-tpl-ts: ticket KR-2611, the tunnel template with factory values`,hi:`Lab fm-tpl-ts: ticket KR-2611, factory values wala tunnel template`},body:{en:`
<p>A doctor does not start with the medicine. She starts with questions, then looks at the patient, then decides. A troubleshooting lab asks you to behave the same way: collect evidence first, change one thing second. In this lab the patient is the Trichy branch TRY-FGT and the complaint is "nothing reached the branch". Your job is to find the real state, correct what is wrong, and prove the repair.</p>

<h3>The ticket</h3>
<p>Ticket KR-2611: a colleague assigned the DNS template KR-DNS and the IPsec template KR-IPSEC to TRY-FGT and went home. Nothing reached the branch. The IPsec template still has the values of the Fortinet-recommended template. The hub gateway is 198.51.100.10 and the pre-shared key is Kaveri-IPsec-2026. You must find the state, correct the template, preview, and install. This is a troubleshooting lab of about 30 minutes, with three tasks.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting sequence">
<rect x="10" y="30" width="190" height="60" rx="8" fill="#fde68a"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 Read the state</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">status, assignment, template</text>
<rect x="225" y="30" width="190" height="60" rx="8" fill="#bae6fd"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Correct one thing</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">gateway and key in KR-IPSEC</text>
<rect x="440" y="30" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Preview, install, prove</text><text x="535" y="76" text-anchor="middle" class="svg-muted" font-size="12">show on TRY-FGT</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="2"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Evidence, one change, proof.</p></div>

<h3>Task 1: read the state</h3>
<p>Start with <code>diagnose dvm device list</code>. The lab asks what dev-db says and why nothing reached the branch. The answer to the second half is the same in every version of this problem: assigning is not installing. FortiManager has the settings, the FortiGate does not. Do not stop at the status line, though. In this lab the starting state is built with the assignments already in place, and the single dev-db word can be misleading, so confirm with two checks that cannot lie.</p>
<ul>
<li><code>execute fmgui install-preview Kaveri TRY-FGT</code> prints what would be sent. If it lists lines, FortiManager holds settings for this device.</li>
<li><code>show system dns</code> and <code>show vpn ipsec phase1-interface</code> on TRY-FGT show what the device really has. Empty means nothing arrived.</li>
</ul>
<p>Also read the template itself with <code>show pm template KR-IPSEC</code>. This is where the factory values are visible:</p>
<pre class="out">FMG-1 # show pm template KR-IPSEC
config pm template
    edit "KR-IPSEC"
        set adom "Kaveri"
        set kind ipsec
        set tunnel-name "TO-HQ"
        <span class="hl">set remote-gw 203.0.113.1</span>
        <span class="hl">set psksecret "change-me-now"</span>
        set source "Branch_IPSec_Recommended"
    next
end</pre>
<p>And the preview shows the same values as they would be installed, 23 lines in total:</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (23 CLI lines, nothing is sent to the device):
  config system dns
  ...
  config vpn ipsec phase1-interface
  edit "TO-HQ"
  ...
  set remote-gw 203.0.113.1
  set psksecret change-me-now</pre>

<h3>Task 2: correct the template</h3>
<p>The repair belongs in the template, not on the FortiGate. Set the remote gateway to 198.51.100.10 and the pre-shared key to Kaveri-IPsec-2026 in KR-IPSEC. Two values, nothing else. Do not create a new template and do not touch the DNS template, which is fine. Read the template again to check both lines. Typing the key wrongly is the classic error, and the lab checks it exactly.</p>

<h3>Task 3: preview, install, prove</h3>
<p>Run the preview again: the same 23 lines, but with the new gateway and key. Then install the device settings. Do not use install-package: no policy package is part of this ticket. Finally prove the result on the FortiGate.</p>
<pre class="out">TRY-FGT # show vpn ipsec phase1-interface
config vpn ipsec phase1-interface
    edit "TO-HQ"
        set interface "port1"
        set ike-version 2
        <span class="hl">set remote-gw 198.51.100.10</span>
        set psksecret ENC 113b2c3f283377130a293f3977686a686c
    next
end

FMG-1 # diagnose dvm device list TRY-FGT
        |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up; source: FMG</pre>

<h3>Why the colleague's install never ran</h3>
<p>Nothing was wrong with the connection (conn: up, conf: in sync). The only missing action was the install. When a ticket says "nothing reached the branch", first split the question: is the tunnel to the device up, are settings assigned, did an install run, and were the values right? Here the first is fine, the second is done, the third is missing, and the fourth is wrong. Two faults hide behind one complaint.</p>

<h3>Common wrong turns</h3>
<ul>
<li>Fixing the FortiGate by hand with a local phase 1 edit. That makes conf out of sync and does not repair the template.</li>
<li>Correcting the template and forgetting the install. The status stays pending and the branch stays unchanged.</li>
<li>Correcting only the gateway and leaving the old key, or the other way round.</li>
<li>Installing before reading the template, so the factory values go to the branch first and a third install is needed.</li>
<li>Pasting the preview with the clear-text key into the ticket.</li>
</ul>

<div class="warn"><p><b>Watch for.</b> A successful install of wrong values shows green. Judge the result by the values on the FortiGate, not by the word success.</p></div>

<div class="exam"><p><b>Exam traps.</b> A template that was assigned but not installed has not reached the device, whatever the connection status says. The FortiGate stores the key encrypted (ENC); the preview on FortiManager prints it in clear text. A repair belongs in the template.</p></div>

<div class="scn"><h4>The ticket closed too early</h4><p>The first engineer on KR-2611 saw the tunnel configured on TRY-FGT after an install and closed the ticket. Two days later the branch still could not reach the hub. The remote-gw on the device was still 203.0.113.1, the sample value, because he had installed before correcting the template. The second engineer corrected the two values, ran the preview, installed, and showed the phase 1 output with 198.51.100.10 in the ticket.</p><p><b>Lesson:</b> close a template ticket with evidence from the device, in the form of a show output, not with the task message.</p></div>

<div class="iv"><p class="q">"A branch has not received its VPN settings. What is your first move?"</p><p>I separate connection, assignment, install and content. I check that the device is connected and in sync, that the template is assigned, whether an install ran, and whether the template values are correct. The preview and a show command on the device settle the last two questions. I fix the template, install, and close the ticket with the device output.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assigned is not installed; use preview and show commands, not only the status word, as proof.</li>
<li>Read the template: factory values (203.0.113.1, change-me-now) are a typical hidden fault.</li>
<li>Repair in the template, then preview and install the device settings.</li>
<li>Verify the remote-gw on TRY-FGT; the device shows the key encrypted.</li>
<li>One complaint can hide two faults: a missing install and wrong content.</li>
</ul></div>
`,hi:`
<p>Doctor dawai se shuru nahi karti. Wo sawaalon se shuru karti hai, phir patient ko dekhti hai, phir faisla karti hai. Troubleshooting lab aapse wahi vyavahar maangta hai: pehle evidence jama karo, phir ek cheez badlo. Is lab mein patient Trichy branch TRY-FGT hai aur shikayat hai "branch tak kuch nahi pahuncha". Aapka kaam hai asli state dhoondhna, jo galat hai use sahi karna, aur repair ko sabit karna.</p>

<h3>Ticket</h3>
<p>Ticket KR-2611: ek colleague ne TRY-FGT ko DNS template KR-DNS aur IPsec template KR-IPSEC assign kiya aur ghar chala gaya. Branch tak kuch nahi pahuncha. IPsec template mein abhi Fortinet-recommended template ki values hain. Hub gateway 198.51.100.10 hai aur pre-shared key Kaveri-IPsec-2026. Aapko state dhoondhna hai, template sahi karna hai, preview aur install karna hai. Ye lagbhag 30 minute ka troubleshooting lab hai, teen tasks ke saath.</p>

<div class="dia"><svg viewBox="0 0 640 140" role="img" aria-label="Troubleshooting sequence">
<rect x="10" y="30" width="190" height="60" rx="8" fill="#fde68a"/><text x="105" y="56" text-anchor="middle" class="svg-ink" font-size="13">1 State padho</text><text x="105" y="76" text-anchor="middle" class="svg-muted" font-size="12">status, assignment, template</text>
<rect x="225" y="30" width="190" height="60" rx="8" fill="#bae6fd"/><text x="320" y="56" text-anchor="middle" class="svg-ink" font-size="13">2 Ek cheez sahi karo</text><text x="320" y="76" text-anchor="middle" class="svg-muted" font-size="12">KR-IPSEC ka gateway aur key</text>
<rect x="440" y="30" width="190" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="56" text-anchor="middle" class="svg-ink" font-size="13">3 Preview, install, proof</text><text x="535" y="76" text-anchor="middle" class="svg-muted" font-size="12">TRY-FGT par show</text>
<line x1="200" y1="60" x2="225" y2="60" stroke="#64748b" stroke-width="2"/><line x1="415" y1="60" x2="440" y2="60" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Evidence, ek change, proof.</p></div>

<h3>Task 1: state padho</h3>
<p><code>diagnose dvm device list</code> se shuru karo. Lab puchta hai dev-db kya kehta hai aur branch tak kuch kyun nahi pahuncha. Doosre hisse ka jawab is problem ke har version mein same hai: assign karna install karna nahi hai. FortiManager ke paas settings hain, FortiGate ke paas nahi. Lekin status line par mat ruko. Is lab mein starting state assignments pehle se lagakar banaya gaya hai, aur akela dev-db word gumrah kar sakta hai, isliye do aise checks se confirm karo jo jhooth nahi bolte.</p>
<ul>
<li><code>execute fmgui install-preview Kaveri TRY-FGT</code> print karta hai kya bheja jayega. Lines list ho to FortiManager ke paas is device ki settings hain.</li>
<li>TRY-FGT par <code>show system dns</code> aur <code>show vpn ipsec phase1-interface</code> dikhate hain device ke paas asal mein kya hai. Khaali matlab kuch nahi pahuncha.</li>
</ul>
<p>Template ko bhi <code>show pm template KR-IPSEC</code> se padho. Factory values yahin dikhti hain:</p>
<pre class="out">FMG-1 # show pm template KR-IPSEC
config pm template
    edit "KR-IPSEC"
        set adom "Kaveri"
        set kind ipsec
        set tunnel-name "TO-HQ"
        <span class="hl">set remote-gw 203.0.113.1</span>
        <span class="hl">set psksecret "change-me-now"</span>
        set source "Branch_IPSec_Recommended"
    next
end</pre>
<p>Aur preview wahi values dikhata hai jaisi install hongi, kul 23 lines:</p>
<pre class="out">FMG-1 # execute fmgui install-preview Kaveri TRY-FGT
Install preview for TRY-FGT (23 CLI lines, nothing is sent to the device):
  config system dns
  ...
  config vpn ipsec phase1-interface
  edit "TO-HQ"
  ...
  set remote-gw 203.0.113.1
  set psksecret change-me-now</pre>

<h3>Task 2: template sahi karo</h3>
<p>Repair template mein hoti hai, FortiGate par nahi. KR-IPSEC mein remote gateway 198.51.100.10 aur pre-shared key Kaveri-IPsec-2026 set karo. Do values, aur kuch nahi. Naya template mat banao aur DNS template ko haath mat lagao, wo theek hai. Dono lines check karne ke liye template dubara padho. Key galat type karna classic galti hai, aur lab use exactly check karta hai.</p>

<h3>Task 3: preview, install, proof</h3>
<p>Preview dubara chalao: wahi 23 lines, par naye gateway aur key ke saath. Phir device settings install karo. install-package use mat karo: is ticket mein koi policy package nahi hai. Aakhir mein FortiGate par result sabit karo.</p>
<pre class="out">TRY-FGT # show vpn ipsec phase1-interface
config vpn ipsec phase1-interface
    edit "TO-HQ"
        set interface "port1"
        set ike-version 2
        <span class="hl">set remote-gw 198.51.100.10</span>
        set psksecret ENC 113b2c3f283377130a293f3977686a686c
    next
end

FMG-1 # diagnose dvm device list TRY-FGT
        |- STATUS: dev-db: not modified; conf: in sync; cond: OK; dm: installed; conn: up; source: FMG</pre>

<h3>Colleague ka install kyun nahi chala</h3>
<p>Connection mein koi problem nahi thi (conn: up, conf: in sync). Sirf install action missing tha. Ticket kahe "branch tak kuch nahi pahuncha" to pehle sawaal todo: device tak tunnel up hai, settings assigned hain, install chala, aur values sahi thi? Yahan pehla theek hai, doosra ho chuka hai, teesra missing hai, aur chauthi galat hai. Ek shikayat ke peeche do faults chhupe hain.</p>

<h3>Common wrong turns</h3>
<ul>
<li>FortiGate par local phase 1 edit se haath se fix karna. Isse conf out of sync ho jata hai aur template theek nahi hota.</li>
<li>Template sahi karke install bhool jana. Status pending rehta hai aur branch unchanged.</li>
<li>Sirf gateway sahi karna aur purani key chhod dena, ya ulta.</li>
<li>Template padhe bina install karna, jisse factory values pehle branch tak jati hain aur teesra install lagta hai.</li>
<li>Clear-text key wala preview ticket mein paste karna.</li>
</ul>

<div class="warn"><p><b>Dhyan do.</b> Galat values ka successful install bhi green dikhta hai. Result ko FortiGate ki values se judge karo, success word se nahi.</p></div>

<div class="exam"><p><b>Exam traps.</b> Jo template assigned hai par install nahi hua wo device tak nahi pahuncha, chahe connection status kuch bhi kahe. FortiGate key ko encrypted (ENC) store karta hai; FortiManager ka preview use clear text mein print karta hai. Repair template mein hoti hai.</p></div>

<div class="scn"><h4>Ticket bahut jaldi band hua</h4><p>KR-2611 par pehle engineer ne install ke baad TRY-FGT par tunnel configured dekha aur ticket band kar diya. Do din baad bhi branch hub tak nahi pahunch rahi thi. Device par remote-gw abhi bhi 203.0.113.1 tha, sample value, kyunki usne template sahi karne se pehle install kiya tha. Doosre engineer ne do values sahi ki, preview chalaya, install kiya, aur ticket mein 198.51.100.10 wala phase 1 output dikhaya.</p><p><b>Lesson:</b> template ticket ko device ke evidence se band karo, show output ke roop mein, task message se nahi.</p></div>

<div class="iv"><p class="q">"Branch ko uski VPN settings nahi mili. Pehla kadam kya hoga?"</p><p>Main connection, assignment, install aur content ko alag karta hoon. Dekhta hoon device connected aur in sync hai, template assigned hai, install chala ya nahi, aur template values sahi hain ya nahi. Aakhri do sawal preview aur device par show command se tay hote hain. Template fix karta hoon, install karta hoon, aur ticket device output ke saath band karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Assigned install nahi hai; proof ke liye sirf status word nahi, preview aur show commands use karo.</li>
<li>Template padho: factory values (203.0.113.1, change-me-now) typical chhupa fault hain.</li>
<li>Repair template mein karo, phir preview aur device settings install karo.</li>
<li>TRY-FGT par remote-gw verify karo; device key encrypted dikhata hai.</li>
<li>Ek shikayat ke peeche do faults ho sakte hain: missing install aur galat content.</li>
</ul></div>
`}};export{e as default};