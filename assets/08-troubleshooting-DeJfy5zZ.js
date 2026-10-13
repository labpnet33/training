var e={id:`troubleshooting`,h:{en:`Troubleshooting a VPN: a five-stage workflow`,hi:`VPN troubleshooting: paanch-stage workflow`},body:{en:`
<p>VPN troubleshooting feels hard because there are two firewalls, two administrators and a hostile Internet in between. The trick is to split the problem into stages and decide at which stage it stops. Like a courier delivery: did the courier find the building (phase 1), get the parcel signed in (phase 2), reach the right desk (routing) and was it allowed in (policy)? This chapter gives a repeatable workflow. You cannot practise it in the simulator, because it has no IKE engine; practise the supporting CLI skills in pan-diag, pan-policy and pan-setup, and compare with nse4-ipsec and sec-asa-vpn.</p>

<h3>The five-stage workflow</h3>
<ol>
<li><b>Underlay</b>: can the firewall reach the peer's public address? Check the interface, default route and any upstream ACL. IKE needs UDP 500 and 4500, and ESP needs IP protocol 50 end to end.</li>
<li><b>Phase 1</b>: does the IKE SA form? If not, read the system log reason: authentication failure, proposal mismatch, no response.</li>
<li><b>Phase 2</b>: does the IPsec SA form? If not, suspect IPsec proposals, PFS group, or proxy IDs.</li>
<li><b>Forwarding</b>: is the traffic routed to the tunnel interface, allowed by policy and exempt from NAT?</li>
<li><b>Performance and stability</b>: MTU, rekeys, flaps, DPD, monitoring.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Five stage workflow">
<rect x="6" y="50" width="116" height="70" rx="10" fill="#e2e8f0"/><text x="64" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay</text><text x="64" y="100" text-anchor="middle" class="svg-muted" font-size="11">reach, UDP 500/4500</text>
<rect x="130" y="50" width="116" height="70" rx="10" fill="#bae6fd"/><text x="188" y="80" text-anchor="middle" class="svg-ink" font-size="13">2 Phase 1</text><text x="188" y="100" text-anchor="middle" class="svg-muted" font-size="11">IKE SA</text>
<rect x="254" y="50" width="116" height="70" rx="10" fill="#ddd6fe"/><text x="312" y="80" text-anchor="middle" class="svg-ink" font-size="13">3 Phase 2</text><text x="312" y="100" text-anchor="middle" class="svg-muted" font-size="11">IPsec SA, proxy ID</text>
<rect x="378" y="50" width="116" height="70" rx="10" fill="#bbf7d0"/><text x="436" y="80" text-anchor="middle" class="svg-ink" font-size="13">4 Forwarding</text><text x="436" y="100" text-anchor="middle" class="svg-muted" font-size="11">route, policy, NAT</text>
<rect x="502" y="50" width="132" height="70" rx="10" fill="#fde68a"/><text x="568" y="80" text-anchor="middle" class="svg-ink" font-size="13">5 Stability</text><text x="568" y="100" text-anchor="middle" class="svg-muted" font-size="11">MTU, rekey, DPD</text>
</svg><p class="cap">Find the first stage that fails. Fix it, then move on.</p></div>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>No IKE SA, log says no response</td><td>Peer unreachable, UDP 500 blocked, wrong peer address, passive on both sides</td><td>Ping, upstream ACLs, peer address, who initiates</td></tr>
<tr><td>Authentication failed</td><td>Pre-shared key mismatch, identity mismatch, expired or untrusted certificate</td><td>Key (compare securely), local and peer ID, certificate dates and chain</td></tr>
<tr><td>Proposal mismatch in phase 1</td><td>Different DH group, encryption, hash or IKE version</td><td>IKE crypto profiles on both ends</td></tr>
<tr><td>Phase 1 up, phase 2 down</td><td>IPsec proposal or PFS mismatch, proxy ID mismatch</td><td>IPsec crypto profile, proxy IDs, peer ACL</td></tr>
<tr><td>Both SAs up, no traffic</td><td>Route, policy, NAT or remote side rule missing</td><td>FIB lookup, policy-match, no-NAT, peer logs</td></tr>
<tr><td>Traffic one way</td><td>Return rule missing, asymmetric routing, remote NAT</td><td>flow counters in both directions, remote policy</td></tr>
<tr><td>Ping works, big transfers stall</td><td>MTU or MSS</td><td>Tunnel MTU, TCP MSS adjustment, ICMP</td></tr>
<tr><td>Tunnel flaps</td><td>Lifetime mismatch, DPD tripping, unstable underlay, duplicate or overlapping SAs</td><td>System log timeline, lifetimes, monitor settings</td></tr>
</table>

<h3>Read the log first</h3>
<p>The system log and <code>ikemgr.log</code> usually name the reason in plain words. Learn to spot four phrases: authentication or pre-shared key failure, no proposal chosen, no response from the peer, and traffic selector or proxy ID mismatch. Each maps to one row in the table above.</p>

<h3>Test with evidence, not guesses</h3>
<ul>
<li>Start negotiation from the CLI with the test commands while you follow the log live.</li>
<li>Compare both ends side by side with the one-page value table from chapter 4.</li>
<li>Ask the remote administrator for their log lines at the same timestamp. Phase 1 problems are often visible on the responder, not the initiator.</li>
<li>Change one thing at a time and record it.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> A new tunnel to a supplier will not come up. Stage 1: ping to the supplier's address works. Stage 2: the log reports an authentication failure. Both sides' pre-shared keys look the same, but the supplier uses an FQDN as its local identity while HQ expects its IP address. Setting the peer identification at HQ to the supplier's FQDN brings up phase 1. Phase 2 then fails with a traffic selector problem: the supplier offered 10.30.0.0/24 but HQ expected 10.30.0.0/16. After they agree the same subnet pair, the tunnel is fully up. Stage 4 shows a missing policy; added, traffic flows.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Changing many settings at once. If it starts working you will not know why, and if it does not you cannot undo cleanly. One change, one test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 up and phase 2 down: look at IPsec profile, PFS and proxy IDs. Both up but no traffic: routing, policy, NAT. Authentication errors: key, identity, certificate.</p></div>

<div class="scn"><h4>Friday-night flapping tunnel</h4><p>A branch tunnel dropped every hour on the hour. The system log showed an IPsec rekey followed by a phase 2 failure. HQ's IPsec lifetime was one hour with PFS group 14; the peer's was one hour with no PFS. During each rekey the proposals disagreed. Setting the same PFS group on both ends ended the hourly drops.</p><p><b>Lesson:</b> a problem on a regular schedule points at lifetimes and rekeys.</p></div>

<div class="iv"><p class="q">"A VPN tunnel is down. How do you approach it?"</p><p>I split it into underlay, phase 1, phase 2, forwarding and stability. I read the system log and ikemgr log for the reason, compare both ends against a value table, and test one change at a time. Phase 1 failure usually means reachability, key, identity or proposals; phase 2 failure means IPsec proposals, PFS or proxy IDs; no traffic with SAs up means routing, policy or NAT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Five stages: underlay, phase 1, phase 2, forwarding, stability.</li>
<li>The log names the reason: authentication, proposal, no response, selectors.</li>
<li>Compare both ends side by side and involve the remote admin early.</li>
<li>Change one thing at a time.</li>
<li>Regular, timed drops point to lifetimes, PFS or rekey mismatches.</li>
</ul></div>
`,hi:`
<p>VPN troubleshooting mushkil lagta hai kyunki do firewalls hain, do administrators hain aur beech mein dushman Internet hai. Trick yeh hai ki problem ko stages mein baant do aur tay karo ki woh kis stage par ruk rahi hai. Courier delivery ki tarah: courier ko building mili (phase 1), parcel sign-in hua (phase 2), sahi desk tak pahuncha (routing) aur andar aane diya gaya (policy)? Yeh chapter ek repeatable workflow deta hai. Aap ise simulator mein practise nahi kar sakte kyunki usme IKE engine nahi hai; supporting CLI skills pan-diag, pan-policy aur pan-setup mein practise karo, aur nse4-ipsec aur sec-asa-vpn se compare karo.</p>

<h3>Paanch-stage workflow</h3>
<ol>
<li><b>Underlay</b>: kya firewall peer ke public address tak pahunch sakta hai? Interface, default route aur kisi upstream ACL ko check karo. IKE ko UDP 500 aur 4500 chahiye, aur ESP ko IP protocol 50 end to end.</li>
<li><b>Phase 1</b>: kya IKE SA banta hai? Nahi to system log ki wajah padho: authentication failure, proposal mismatch, no response.</li>
<li><b>Phase 2</b>: kya IPsec SA banta hai? Nahi to IPsec proposals, PFS group ya proxy IDs par shak karo.</li>
<li><b>Forwarding</b>: kya traffic tunnel interface ko route hota hai, policy se allowed hai aur NAT se exempt hai?</li>
<li><b>Performance aur stability</b>: MTU, rekeys, flaps, DPD, monitoring.</li>
</ol>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Five stage workflow">
<rect x="6" y="50" width="116" height="70" rx="10" fill="#e2e8f0"/><text x="64" y="80" text-anchor="middle" class="svg-ink" font-size="13">1 Underlay</text><text x="64" y="100" text-anchor="middle" class="svg-muted" font-size="11">reach, UDP 500/4500</text>
<rect x="130" y="50" width="116" height="70" rx="10" fill="#bae6fd"/><text x="188" y="80" text-anchor="middle" class="svg-ink" font-size="13">2 Phase 1</text><text x="188" y="100" text-anchor="middle" class="svg-muted" font-size="11">IKE SA</text>
<rect x="254" y="50" width="116" height="70" rx="10" fill="#ddd6fe"/><text x="312" y="80" text-anchor="middle" class="svg-ink" font-size="13">3 Phase 2</text><text x="312" y="100" text-anchor="middle" class="svg-muted" font-size="11">IPsec SA, proxy ID</text>
<rect x="378" y="50" width="116" height="70" rx="10" fill="#bbf7d0"/><text x="436" y="80" text-anchor="middle" class="svg-ink" font-size="13">4 Forwarding</text><text x="436" y="100" text-anchor="middle" class="svg-muted" font-size="11">route, policy, NAT</text>
<rect x="502" y="50" width="132" height="70" rx="10" fill="#fde68a"/><text x="568" y="80" text-anchor="middle" class="svg-ink" font-size="13">5 Stability</text><text x="568" y="100" text-anchor="middle" class="svg-muted" font-size="11">MTU, rekey, DPD</text>
</svg><p class="cap">Pehla fail hone wala stage dhoondho. Use fix karo, phir aage badho.</p></div>

<h3>Symptom table</h3>
<table class="cmp"><tr><th>Symptom</th><th>Likely cause</th><th>Check</th></tr>
<tr><td>IKE SA nahi, log kehta hai no response</td><td>Peer unreachable, UDP 500 blocked, galat peer address, dono sides passive</td><td>Ping, upstream ACLs, peer address, initiate kaun karta hai</td></tr>
<tr><td>Authentication failed</td><td>Pre-shared key mismatch, identity mismatch, expired ya untrusted certificate</td><td>Key (surakshit tareeke se compare), local aur peer ID, certificate dates aur chain</td></tr>
<tr><td>Phase 1 mein proposal mismatch</td><td>Alag DH group, encryption, hash ya IKE version</td><td>Dono ends ke IKE crypto profiles</td></tr>
<tr><td>Phase 1 up, phase 2 down</td><td>IPsec proposal ya PFS mismatch, proxy ID mismatch</td><td>IPsec crypto profile, proxy IDs, peer ACL</td></tr>
<tr><td>Dono SAs up, traffic nahi</td><td>Route, policy, NAT ya remote side rule missing</td><td>FIB lookup, policy-match, no-NAT, peer logs</td></tr>
<tr><td>Traffic ek taraf</td><td>Return rule missing, asymmetric routing, remote NAT</td><td>Dono directions ke flow counters, remote policy</td></tr>
<tr><td>Ping chalta hai, bade transfers atakte hain</td><td>MTU ya MSS</td><td>Tunnel MTU, TCP MSS adjustment, ICMP</td></tr>
<tr><td>Tunnel flap karta hai</td><td>Lifetime mismatch, DPD trip hona, unstable underlay, duplicate ya overlapping SAs</td><td>System log timeline, lifetimes, monitor settings</td></tr>
</table>

<h3>Pehle log padho</h3>
<p>System log aur <code>ikemgr.log</code> aam taur par wajah saaf shabdon mein bata dete hain. Chaar phrases pehchanna seekho: authentication ya pre-shared key failure, no proposal chosen, no response from the peer, aur traffic selector ya proxy ID mismatch. Har ek upar ki table ki ek row se match karta hai.</p>

<h3>Evidence se test karo, guess se nahi</h3>
<ul>
<li>Log ko live follow karte hue test commands se CLI se negotiation shuru karo.</li>
<li>Chapter 4 ki ek-page value table se dono ends ko side by side compare karo.</li>
<li>Remote administrator se same timestamp ki unki log lines maango. Phase 1 problems aksar responder par dikhti hain, initiator par nahi.</li>
<li>Ek baar mein ek cheez badlo aur record karo.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Supplier ka naya tunnel up nahi aa raha. Stage 1: supplier ke address ka ping chalta hai. Stage 2: log authentication failure report karta hai. Dono sides ki pre-shared keys same dikhti hain, lekin supplier apni local identity FQDN rakhta hai jabki HQ IP address expect karta hai. HQ par peer identification ko supplier ke FQDN par set karne se phase 1 up aata hai. Phir phase 2 traffic selector problem ke saath fail hota hai: supplier ne 10.30.0.0/24 offer kiya lekin HQ ko 10.30.0.0/16 chahiye tha. Same subnet pair par agree karne ke baad tunnel poori tarah up ho jaata hai. Stage 4 mein policy missing dikhti hai; jodi, traffic chalta hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Ek saath kai settings badalna. Chalne lage to pata nahi kyun, aur na chale to saaf undo nahi kar sakte. Ek change, ek test.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 up aur phase 2 down: IPsec profile, PFS aur proxy IDs dekho. Dono up lekin traffic nahi: routing, policy, NAT. Authentication errors: key, identity, certificate.</p></div>

<div class="scn"><h4>Friday-night flapping tunnel</h4><p>Ek branch tunnel har ghante ke ghante par gir jaata tha. System log mein IPsec rekey ke baad phase 2 failure dikhta tha. HQ ki IPsec lifetime ek ghanta thi PFS group 14 ke saath; peer ki ek ghanta bina PFS ke. Har rekey ke dauraan proposals mein asahmati hoti thi. Dono ends par same PFS group set karne se hourly drops band ho gaye.</p><p><b>Lesson:</b> regular schedule par hone wali problem lifetimes aur rekeys ki taraf ishara karti hai.</p></div>

<div class="iv"><p class="q">"VPN tunnel down hai. Kaise approach karte ho?"</p><p>Main ise underlay, phase 1, phase 2, forwarding aur stability mein baantta hoon. Wajah ke liye system log aur ikemgr log padhta hoon, dono ends ko value table se compare karta hoon, aur ek baar mein ek change test karta hoon. Phase 1 failure aam taur par reachability, key, identity ya proposals hai; phase 2 failure ka matlab IPsec proposals, PFS ya proxy IDs; SAs up ke saath traffic nahi ka matlab routing, policy ya NAT.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Paanch stages: underlay, phase 1, phase 2, forwarding, stability.</li>
<li>Log wajah batata hai: authentication, proposal, no response, selectors.</li>
<li>Dono ends side by side compare karo aur remote admin ko jaldi involve karo.</li>
<li>Ek baar mein ek cheez badlo.</li>
<li>Regular, timed drops lifetimes, PFS ya rekey mismatches ki taraf ishara karte hain.</li>
</ul></div>
`}};export{e as default};