var e={id:`ike-troubleshooting`,h:{en:`The IKE troubleshooting workflow: ticket KR-2310`,hi:`IKE troubleshooting workflow: ticket KR-2310`},body:{en:`
<p>When a courier cannot deliver a parcel, the tracking page tells you where it stopped: at the sorting hub, at the address, or at the signature. IKE gives you the same kind of tracking, but only if you switch it on and read it in order. The big idea: <b>the debug is a conversation, and the last thing said before silence is the answer.</b></p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="IKE troubleshooting workflow">
<rect x="10" y="40" width="92" height="60" rx="8" fill="#bae6fd"/><text x="56" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 State</text><text x="56" y="86" text-anchor="middle" class="svg-muted" font-size="11">summary, gateway</text>
<rect x="115" y="40" width="92" height="60" rx="8" fill="#bbf7d0"/><text x="161" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Underlay</text><text x="161" y="86" text-anchor="middle" class="svg-muted" font-size="11">UDP/500 path</text>
<rect x="220" y="40" width="92" height="60" rx="8" fill="#ddd6fe"/><text x="266" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text><text x="266" y="86" text-anchor="middle" class="svg-muted" font-size="11">tunnel in policy</text>
<rect x="325" y="40" width="92" height="60" rx="8" fill="#fde68a"/><text x="371" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Filter</text><text x="371" y="86" text-anchor="middle" class="svg-muted" font-size="11">log filter name</text>
<rect x="430" y="40" width="92" height="60" rx="8" fill="#fed7aa"/><text x="476" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Debug</text><text x="476" y="86" text-anchor="middle" class="svg-muted" font-size="11">read the notify</text>
<rect x="535" y="40" width="92" height="60" rx="8" fill="#e2e8f0"/><text x="581" y="66" text-anchor="middle" class="svg-ink" font-size="13">6 Fix, clear</text><text x="581" y="86" text-anchor="middle" class="svg-muted" font-size="11">and retest</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Always disable the debug when you are done.</text>
</svg><p class="cap">Six steps, same order every time.</p></div>
<ol>
<li><b>State.</b> <code>get vpn ipsec tunnel summary</code> shows each tunnel with <code>selectors(total,up)</code>. <code>diagnose vpn ike gateway list name TO-HQ</code> shows the IKE SA (phase 1). <code>diagnose vpn tunnel list name TO-HQ</code> shows the IPsec SA (phase 2).</li>
<li><b>Underlay.</b> UDP/500 must work both ways between 203.0.113.12 and 203.0.113.1. No UDP/500 means no reply and a timeout in the log.</li>
<li><b>Policy.</b> The tunnel interface must be named in a firewall policy on both sides. Without it you see "ignoring IKE request, no policy configured".</li>
<li><b>Filter.</b> <code>diagnose vpn ike log filter name TO-HQ</code> narrows the output to one tunnel. Without a filter a busy hub floods your screen.</li>
<li><b>Debug.</b> <code>diagnose debug application ike -1</code> then <code>diagnose debug enable</code>. Trigger the tunnel, read, then <code>diagnose debug disable</code> and <code>diagnose debug reset</code>.</li>
<li><b>Fix and clear.</b> Change the config, then <code>diagnose vpn ike gateway clear name TO-HQ</code> (and <code>diagnose vpn tunnel flush</code> if needed) to force a clean negotiation.</li>
</ol>

<h3>Reading the notify</h3>
<table class="cmp"><tr><th>Where</th><th>Message</th><th>Meaning</th></tr>
<tr><td>IKE_SA_INIT</td><td>NO_PROPOSAL_CHOSEN</td><td>Phase 1 proposals or DH do not overlap</td></tr>
<tr><td>IKE_AUTH</td><td>AUTHENTICATION_FAILED</td><td>PSK is wrong</td></tr>
<tr><td>Phase 2</td><td>NO_PROPOSAL_CHOSEN</td><td>Phase 2 proposal or PFS differs</td></tr>
<tr><td>Phase 2</td><td>TS_UNACCEPTABLE</td><td>Selectors do not match</td></tr>
<tr><td>Log</td><td>peer ID / timeout</td><td>Peer ID mismatch; or UDP/500 never answered</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> Reading NO_PROPOSAL_CHOSEN and always blaming phase 1. The same words appear in phase 2. Check the stage: phase 1 up with selectors 1/0 means the problem is in phase 2.</p></div>

<h3>Lab: ticket KR-2310</h3>
<p>The ticket: "After last night's change window the Trichy shop cannot reach the stock server in Chennai. Madurai is fine." HQ-FGT is the hub, MDU-FGT works, TRY-FGT shows its tunnel down. Three faults hide on TRY-FGT, one behind the other.</p>
<p><b>Fault 1.</b> The summary on TRY-FGT shows selectors 0/0. With the filter set and the debug on, you read:</p>
<pre class="out">TRY-FGT # diagnose vpn ike log filter name TO-HQ
TRY-FGT # diagnose debug application ike -1
TRY-FGT # diagnose debug enable
ike 0:TO-HQ: initiator: sent IKE_SA_INIT
ike 0:TO-HQ: <span class="hl">received notify type NO_PROPOSAL_CHOSEN</span></pre>
<p>It came at IKE_SA_INIT, so phase 1. <code>show vpn ipsec phase1-interface TO-HQ</code> reveals <code>proposal aes128-sha1</code>. The hub uses <code>aes256-sha256</code> with DH 14. Fix it:</p>
<pre class="code">config vpn ipsec phase1-interface
    edit "TO-HQ"
        set proposal aes256-sha256
    next
end</pre>
<p><b>Fault 2.</b> After clearing the gateway, a new message appears: <code>received notify type AUTHENTICATION_FAILED</code>, this time in IKE_AUTH. The proposals match now, so the secret is wrong. A typo in the PSK on TRY-FGT. Set <code>psksecret Kaveri-IPsec-2026</code> again.</p>
<p><b>Fault 3.</b> Phase 1 comes up. Yet the summary reads <code>selectors(total,up): 1/0</code> and the interface stays down. Phase 1 up and selectors 1/0 is the signature of a phase 2 problem. The debug repeats NO_PROPOSAL_CHOSEN, now in phase 2. The hub phase 2 KR-P2 has PFS, TRY's TO-HQ-P2 has it disabled:</p>
<pre class="code">config vpn ipsec phase2-interface
    edit "TO-HQ-P2"
        set pfs enable
    next
end</pre>
<pre class="out">TRY-FGT # get vpn ipsec tunnel summary
'TO-HQ' 203.0.113.1:0  selectors(total,up): <span class="hl">1/1</span>  rx(pkt,err): 4/0  tx(pkt,err): 4/0</pre>
<p>On HQ-FGT, the dial-up template never shows "up" itself. Look for the instance <code>KR-ADVPN_1</code> with selectors 1/1 (the first spoke took _0). Finally <code>diagnose debug disable</code>.</p>
<div class="exam"><p><b>Exam trap.</b> The order of checks inside the engine is fixed: reachability, policy, IKE version, peer ID, proposals and DH, PSK, then phase 2. You can only ever see the earliest broken item. Fixing one reveals the next, so do not stop after the first success.</p></div>
<div class="note"><p>Honest scope: certificates, EAP/XAuth, NAT-T, rekey timers and DPD timing are not modelled in the simulator. <code>diagnose vpn ike routes list</code> is also not implemented.</p></div>

<div class="scn"><h4>Three faults, one ticket</h4><p>After the change window Trichy lost its tunnel at 9 a.m. The first engineer rebooted TRY-FGT, which changed nothing. A second engineer used the filter and the debug: NO_PROPOSAL_CHOSEN, then AUTHENTICATION_FAILED, then NO_PROPOSAL_CHOSEN in phase 2. Three small edits, and the instance came up with 1/1 selectors.</p><p><b>Lesson:</b> every reboot-style guess skips the log. The log names the exact stage.</p></div>
<div class="iv"><p class="q">"A spoke never comes up. Walk me through it."</p><p>Tunnel summary, then underlay UDP/500, then policy on both ends, then log filter and IKE debug. Name the notify and the stage: SA_INIT proposals, IKE_AUTH PSK, phase 2 PFS or selectors. Clear the gateway after each fix.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Use the filter, then debug, and disable the debug at the end.</li>
<li>NO_PROPOSAL_CHOSEN at SA_INIT is phase 1; AUTHENTICATION_FAILED is the PSK.</li>
<li>Phase 1 up plus selectors 1/0 is a phase 2 problem.</li>
<li>The dial-up template is never up; look at its instances.</li>
<li>Clear the gateway after every fix to test cleanly.</li>
</ul></div>
`,hi:`
<p>Jab courier parcel deliver nahi kar paata, to tracking page batata hai ki woh kahan ruka: sorting hub par, address par, ya signature par. IKE bhi aisi hi tracking deta hai, lekin tabhi jab aap ise on karo aur order mein padho. Badi baat: <b>debug ek baatcheet hai, aur khamoshi se pehle ki aakhri baat hi jawab hai.</b></p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="IKE troubleshooting workflow">
<rect x="10" y="40" width="92" height="60" rx="8" fill="#bae6fd"/><text x="56" y="66" text-anchor="middle" class="svg-ink" font-size="13">1 State</text><text x="56" y="86" text-anchor="middle" class="svg-muted" font-size="11">summary, gateway</text>
<rect x="115" y="40" width="92" height="60" rx="8" fill="#bbf7d0"/><text x="161" y="66" text-anchor="middle" class="svg-ink" font-size="13">2 Underlay</text><text x="161" y="86" text-anchor="middle" class="svg-muted" font-size="11">UDP/500 path</text>
<rect x="220" y="40" width="92" height="60" rx="8" fill="#ddd6fe"/><text x="266" y="66" text-anchor="middle" class="svg-ink" font-size="13">3 Policy</text><text x="266" y="86" text-anchor="middle" class="svg-muted" font-size="11">policy mein tunnel</text>
<rect x="325" y="40" width="92" height="60" rx="8" fill="#fde68a"/><text x="371" y="66" text-anchor="middle" class="svg-ink" font-size="13">4 Filter</text><text x="371" y="86" text-anchor="middle" class="svg-muted" font-size="11">log filter name</text>
<rect x="430" y="40" width="92" height="60" rx="8" fill="#fed7aa"/><text x="476" y="66" text-anchor="middle" class="svg-ink" font-size="13">5 Debug</text><text x="476" y="86" text-anchor="middle" class="svg-muted" font-size="11">notify padho</text>
<rect x="535" y="40" width="92" height="60" rx="8" fill="#e2e8f0"/><text x="581" y="66" text-anchor="middle" class="svg-ink" font-size="13">6 Fix, clear</text><text x="581" y="86" text-anchor="middle" class="svg-muted" font-size="11">aur retest</text>
<text x="320" y="130" text-anchor="middle" class="svg-accent" font-size="12">Kaam khatam hote hi debug disable karo.</text>
</svg><p class="cap">Chhe steps, har baar wahi order.</p></div>
<ol>
<li><b>State.</b> <code>get vpn ipsec tunnel summary</code> har tunnel ko <code>selectors(total,up)</code> ke saath dikhata hai. <code>diagnose vpn ike gateway list name TO-HQ</code> IKE SA (phase 1) dikhata hai. <code>diagnose vpn tunnel list name TO-HQ</code> IPsec SA (phase 2) dikhata hai.</li>
<li><b>Underlay.</b> 203.0.113.12 aur 203.0.113.1 ke beech UDP/500 dono taraf chalna chahiye. UDP/500 nahi chala to reply nahi aata aur log mein timeout aata hai.</li>
<li><b>Policy.</b> Tunnel interface ka naam dono sides ki firewall policy mein hona chahiye. Nahi hai to "ignoring IKE request, no policy configured" dikhta hai.</li>
<li><b>Filter.</b> <code>diagnose vpn ike log filter name TO-HQ</code> output ko ek tunnel tak limit karta hai. Filter ke bina busy hub screen bhar deta hai.</li>
<li><b>Debug.</b> <code>diagnose debug application ike -1</code> phir <code>diagnose debug enable</code>. Tunnel trigger karo, padho, phir <code>diagnose debug disable</code> aur <code>diagnose debug reset</code>.</li>
<li><b>Fix aur clear.</b> Config badlo, phir saaf negotiation ke liye <code>diagnose vpn ike gateway clear name TO-HQ</code> (zaroorat ho to <code>diagnose vpn tunnel flush</code>) chalao.</li>
</ol>

<h3>Notify padhna</h3>
<table class="cmp"><tr><th>Kahan</th><th>Message</th><th>Matlab</th></tr>
<tr><td>IKE_SA_INIT</td><td>NO_PROPOSAL_CHOSEN</td><td>Phase 1 proposals ya DH overlap nahi karte</td></tr>
<tr><td>IKE_AUTH</td><td>AUTHENTICATION_FAILED</td><td>PSK galat hai</td></tr>
<tr><td>Phase 2</td><td>NO_PROPOSAL_CHOSEN</td><td>Phase 2 proposal ya PFS alag hai</td></tr>
<tr><td>Phase 2</td><td>TS_UNACCEPTABLE</td><td>Selectors match nahi karte</td></tr>
<tr><td>Log</td><td>peer ID / timeout</td><td>Peer ID mismatch; ya UDP/500 ka jawab kabhi nahi aaya</td></tr></table>
<div class="warn"><p><b>Common mistake.</b> NO_PROPOSAL_CHOSEN padhkar hamesha phase 1 ko blame karna. Yahi shabd phase 2 mein bhi aate hain. Stage dekho: phase 1 up aur selectors 1/0 ka matlab problem phase 2 mein hai.</p></div>

<h3>Lab: ticket KR-2310</h3>
<p>Ticket: "Kal raat ke change window ke baad Trichy ki shop Chennai ke stock server tak nahi pahunch pa rahi. Madurai theek hai." HQ-FGT hub hai, MDU-FGT chal raha hai, TRY-FGT ka tunnel down hai. TRY-FGT par teen faults ek ke peeche ek chhupe hain.</p>
<p><b>Fault 1.</b> TRY-FGT ka summary selectors 0/0 dikhata hai. Filter lagakar debug on karne par padhte ho:</p>
<pre class="out">TRY-FGT # diagnose vpn ike log filter name TO-HQ
TRY-FGT # diagnose debug application ike -1
TRY-FGT # diagnose debug enable
ike 0:TO-HQ: initiator: sent IKE_SA_INIT
ike 0:TO-HQ: <span class="hl">received notify type NO_PROPOSAL_CHOSEN</span></pre>
<p>Yeh IKE_SA_INIT par aaya, yaani phase 1. <code>show vpn ipsec phase1-interface TO-HQ</code> mein <code>proposal aes128-sha1</code> milta hai. Hub <code>aes256-sha256</code> aur DH 14 use karta hai. Fix:</p>
<pre class="code">config vpn ipsec phase1-interface
    edit "TO-HQ"
        set proposal aes256-sha256
    next
end</pre>
<p><b>Fault 2.</b> Gateway clear karne ke baad naya message aata hai: <code>received notify type AUTHENTICATION_FAILED</code>, is baar IKE_AUTH mein. Proposals ab match karte hain, to secret galat hai. TRY-FGT par PSK mein typo. <code>psksecret Kaveri-IPsec-2026</code> dobara set karo.</p>
<p><b>Fault 3.</b> Phase 1 up ho jaata hai. Phir bhi summary <code>selectors(total,up): 1/0</code> dikhata hai aur interface down rehta hai. Phase 1 up aur selectors 1/0 phase 2 problem ka signature hai. Debug phir NO_PROPOSAL_CHOSEN dikhata hai, ab phase 2 mein. Hub ke phase 2 KR-P2 mein PFS hai, TRY ke TO-HQ-P2 mein disabled:</p>
<pre class="code">config vpn ipsec phase2-interface
    edit "TO-HQ-P2"
        set pfs enable
    next
end</pre>
<pre class="out">TRY-FGT # get vpn ipsec tunnel summary
'TO-HQ' 203.0.113.1:0  selectors(total,up): <span class="hl">1/1</span>  rx(pkt,err): 4/0  tx(pkt,err): 4/0</pre>
<p>HQ-FGT par dial-up template khud kabhi "up" nahi dikhta. Instance <code>KR-ADVPN_1</code> dekho jiske selectors 1/1 hon (pehle spoke ne _0 le liya). Aakhir mein <code>diagnose debug disable</code>.</p>
<div class="exam"><p><b>Exam trap.</b> Engine ke andar checks ka order fixed hai: reachability, policy, IKE version, peer ID, proposals aur DH, PSK, phir phase 2. Aap hamesha sabse pehla toota item hi dekh sakte ho. Ek fix karne par agla dikhta hai, isliye pehli kamyabi par ruko mat.</p></div>
<div class="note"><p>Honest scope: certificates, EAP/XAuth, NAT-T, rekey timers aur DPD timing simulator mein modelled nahi hain. <code>diagnose vpn ike routes list</code> bhi implemented nahi hai.</p></div>

<div class="scn"><h4>Teen faults, ek ticket</h4><p>Change window ke baad subah 9 baje Trichy ka tunnel gaya. Pehle engineer ne TRY-FGT reboot kiya, kuch nahi badla. Doosre engineer ne filter aur debug use kiya: NO_PROPOSAL_CHOSEN, phir AUTHENTICATION_FAILED, phir phase 2 mein NO_PROPOSAL_CHOSEN. Teen chhote edits, aur instance 1/1 selectors ke saath up aa gaya.</p><p><b>Lesson:</b> reboot jaise andaze log ko skip karte hain. Log exact stage batata hai.</p></div>
<div class="iv"><p class="q">"Ek spoke kabhi up nahi hota. Mujhe step by step batao."</p><p>Tunnel summary, phir underlay UDP/500, phir dono ends par policy, phir log filter aur IKE debug. Notify aur stage ka naam lo: SA_INIT proposals, IKE_AUTH PSK, phase 2 PFS ya selectors. Har fix ke baad gateway clear karo.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pehle filter, phir debug, aur aakhir mein debug disable.</li>
<li>SA_INIT par NO_PROPOSAL_CHOSEN matlab phase 1; AUTHENTICATION_FAILED matlab PSK.</li>
<li>Phase 1 up aur selectors 1/0 matlab phase 2 problem.</li>
<li>Dial-up template kabhi up nahi hota; uske instances dekho.</li>
<li>Saaf test ke liye har fix ke baad gateway clear karo.</li>
</ul></div>
`}};export{e as default};