var e={id:`verification`,h:{en:`Verifying the tunnel: summary, IKE, SAs and counters`,hi:`Tunnel verify karna: summary, IKE, SAs aur counters`},body:{en:`
<p>Verification answers one question in layers: <b>how far did the tunnel get?</b> Did IKE start, did phase 1 finish, did phase 2 create SAs, and are packets being encrypted and decrypted? Each layer has its own command. This chapter lists the commands and, for each, what a healthy result looks like. The commands are real FortiOS commands; because exact output differs by model and version, I describe what to look for rather than printing sample output. They are <b>not run in the simulator</b>.</p>

<h3>Layer by layer</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>What to look for</th></tr>
<tr><td>Overview</td><td><code>get vpn ipsec tunnel summary</code></td><td>The tunnel name, the remote gateway, and a state of up with the number of selectors up.</td></tr>
<tr><td>Phase 1</td><td><code>diagnose vpn ike gateway list</code></td><td>The IKE gateway with the expected remote address, the IKE version, a status of established, the authentication used and lifetime counters.</td></tr>
<tr><td>Phase 2</td><td><code>diagnose vpn tunnel list name to-BRANCH</code></td><td>The selectors (source and destination), the SPIs in both directions, the encryption and authentication algorithms, and the encrypt and decrypt packet and byte counters.</td></tr>
<tr><td>Routing</td><td><code>get router info routing-table details 10.20.0.30</code></td><td>The best route to the remote host uses the tunnel interface as the outgoing device.</td></tr>
<tr><td>Policy</td><td><code>diagnose firewall iprope lookup</code> or the policy hit counts</td><td>The expected accept policy matches the test flow.</td></tr>
<tr><td>Session</td><td><code>diagnose sys session list</code> with a filter</td><td>An entry for the test flow with the tunnel interface as the egress device.</td></tr></table>
<p>The IPsec monitor in the GUI shows the same information graphically: the tunnel, its phase 2 selectors, the bytes in and out, and buttons to bring a tunnel up or down.</p>

<h3>Reading the packet counters</h3>
<p>The most useful clue in the tunnel list is the <b>pair of counters</b>: packets and bytes <b>encrypted</b> (sent into the tunnel) and <b>decrypted</b> (received from it).</p>
<ul>
<li><b>Encrypt rising, decrypt zero:</b> traffic is entering the tunnel, but nothing returns. Suspect the remote side: its route, policy, selectors or an ISP filter dropping ESP or UDP 4500.</li>
<li><b>Both zero, selectors up:</b> no traffic is being routed into the tunnel. Check the route and policy on the local side.</li>
<li><b>Decrypt rising, encrypt zero:</b> the remote is sending, but your replies do not go back through the tunnel. Check your return route and policy.</li>
<li><b>Both rising:</b> the tunnel works. If an application still fails, look at MTU, MSS or the application's own firewall.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Verification layers">
<rect x="20" y="20" width="600" height="28" rx="6" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">6 Application works (MTU, MSS, server firewall)</text>
<rect x="20" y="54" width="600" height="28" rx="6" fill="#bbf7d0"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">5 Counters: encrypt and decrypt both rising</text>
<rect x="20" y="88" width="600" height="28" rx="6" fill="#fde68a"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">4 Route and policy allow the flow</text>
<rect x="20" y="122" width="600" height="28" rx="6" fill="#fed7aa"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="12">3 Phase 2 SAs exist</text>
<rect x="20" y="156" width="290" height="22" rx="6" fill="#ddd6fe"/><text x="165" y="172" text-anchor="middle" class="svg-ink" font-size="12">2 Phase 1 established</text>
<rect x="330" y="156" width="290" height="22" rx="6" fill="#e2e8f0"/><text x="475" y="172" text-anchor="middle" class="svg-ink" font-size="12">1 IKE packets reach the peer</text>
</svg><p class="cap">Work from the bottom up; the first layer that fails is the problem.</p></div>

<h3>Useful active tests</h3>
<ul>
<li><code>execute ping-options source 10.10.0.1</code> then <code>execute ping 10.20.0.1</code> sends a test packet from the LAN address, so that it matches the tunnel's selectors and policy.</li>
<li>A packet sniffer such as <code>diagnose sniffer packet any 'host 198.51.100.10 and (port 500 or port 4500)' 4</code> shows IKE packets leaving and arriving (see <b>nse4-diag</b> for sniffer options). Press Ctrl+C to stop. ESP packets appear as protocol ESP, or as UDP 4500 when NAT-T is active.</li>
<li><code>diagnose vpn ike gateway clear name to-BRANCH</code> clears a stuck IKE gateway, which forces a fresh negotiation. Use it with care in production because it drops the tunnel.</li>
</ul>

<h3>Reading logs</h3>
<p>Event logs under VPN record tunnel up and down events with the reason, such as a DPD failure or a negotiation error. Enable <code>logtraffic all</code> on the tunnel policies while building so you can see the traffic that matches. After handover, reduce log volume to what operations needs, but keep VPN events.</p>

<div class="eg"><p><b>Worked example.</b> A newly built tunnel shows selectors up in the summary. The engineer pings from a branch host; the counters on the HQ tunnel list show the decrypted count rising, but encrypted stays at zero. The HQ firewall is receiving but not replying through the tunnel. The routing table at HQ has the 10.20.0.0/24 route pointing out of port1 because the tunnel route was entered with the wrong device. Fixing the device makes the encrypted counter rise and the pings succeed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Testing from the firewall without setting the source, so the packet does not match the selectors. Reading only the green status and not the counters. Clearing the gateway repeatedly while the real cause is a mismatch. Leaving debug running.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may show tunnel counters and ask for the cause. Encrypt rising with decrypt zero points at the remote end; decrypt rising with encrypt zero points at the local return path.</p></div>

<div class="scn"><h4>Counters tell the story</h4><p>A tunnel to a partner site showed up all week, but a nightly report transfer failed. The tunnel list showed encrypted packets rising and decrypted staying at zero for that selector. The partner admin discovered that a firewall upgrade had removed their return route. Because the team read the counters, the call to the partner took five minutes and named the exact fault.</p><p><b>Lesson:</b> counters show which direction is broken.</p></div>

<div class="iv"><p class="q">"How do you verify an IPsec tunnel on a FortiGate?"</p><p>I check the summary and the IKE gateway list for phase 1, then the tunnel list for phase 2 selectors, SPIs and the encrypt and decrypt counters. I confirm the route and policy for the flow and test with a ping sourced from the LAN address. If the counters are lopsided I know which side to chase.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Verify in layers: IKE, phase 1, phase 2, route, policy, counters.</li>
<li><code>diagnose vpn ike gateway list</code> shows phase 1; <code>diagnose vpn tunnel list</code> shows phase 2.</li>
<li>Encrypt and decrypt counters reveal which direction fails.</li>
<li>Source test pings from the LAN address so selectors match.</li>
<li>Use the sniffer to see IKE and ESP or UDP 4500.</li>
</ul></div>
`,hi:`
<p>Verification ek sawaal ka jawab layers mein deta hai: <b>tunnel kitni door tak pahuncha?</b> IKE shuru hua, phase 1 khatam hua, phase 2 ne SAs banaye, aur packets encrypt aur decrypt ho rahe hain? Har layer ka apna command hai. Yeh chapter commands list karta hai aur har ek ke liye batata hai ki healthy result kaisa dikhta hai. Commands asli FortiOS commands hain; exact output model aur version ke hisaab se badalta hai, isliye main sample output print karne ke bajaye batata hoon ki kya dekhna hai. Yeh <b>simulator mein nahi chalaye gaye hain</b>.</p>

<h3>Layer by layer</h3>
<table class="cmp"><tr><th>Layer</th><th>Command</th><th>Kya dekhna hai</th></tr>
<tr><td>Overview</td><td><code>get vpn ipsec tunnel summary</code></td><td>Tunnel name, remote gateway, aur up state, kitne selectors up hain.</td></tr>
<tr><td>Phase 1</td><td><code>diagnose vpn ike gateway list</code></td><td>Expected remote address wala IKE gateway, IKE version, established status, use hua authentication aur lifetime counters.</td></tr>
<tr><td>Phase 2</td><td><code>diagnose vpn tunnel list name to-BRANCH</code></td><td>Selectors (source aur destination), dono directions ke SPIs, encryption aur authentication algorithms, aur encrypt aur decrypt packet aur byte counters.</td></tr>
<tr><td>Routing</td><td><code>get router info routing-table details 10.20.0.30</code></td><td>Remote host ka best route outgoing device ki tarah tunnel interface use karta hai.</td></tr>
<tr><td>Policy</td><td><code>diagnose firewall iprope lookup</code> ya policy hit counts</td><td>Expected accept policy test flow se match karti hai.</td></tr>
<tr><td>Session</td><td>filter ke saath <code>diagnose sys session list</code></td><td>Test flow ki entry jisme egress device tunnel interface hai.</td></tr></table>
<p>GUI ka IPsec monitor wahi information graphically dikhata hai: tunnel, uske phase 2 selectors, bytes in aur out, aur tunnel ko up ya down karne ke buttons.</p>

<h3>Packet counters padhna</h3>
<p>Tunnel list ka sabse useful clue <b>counters ki jodi</b> hai: <b>encrypted</b> (tunnel mein bheje gaye) aur <b>decrypted</b> (tunnel se mile) packets aur bytes.</p>
<ul>
<li><b>Encrypt badh raha, decrypt zero:</b> traffic tunnel mein ja raha hai, lekin kuch wapas nahi aa raha. Remote side par shak karo: uska route, policy, selectors ya ISP filter jo ESP ya UDP 4500 drop kar raha ho.</li>
<li><b>Dono zero, selectors up:</b> koi traffic tunnel mein route nahi ho raha. Local side ka route aur policy check karo.</li>
<li><b>Decrypt badh raha, encrypt zero:</b> remote bhej raha hai, lekin aapke replies tunnel se wapas nahi ja rahe. Apna return route aur policy check karo.</li>
<li><b>Dono badh rahe:</b> tunnel kaam karta hai. Application phir bhi fail ho to MTU, MSS ya application ka apna firewall dekho.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Verification layers">
<rect x="20" y="20" width="600" height="28" rx="6" fill="#bae6fd"/><text x="320" y="40" text-anchor="middle" class="svg-ink" font-size="12">6 Application chalti hai (MTU, MSS, server firewall)</text>
<rect x="20" y="54" width="600" height="28" rx="6" fill="#bbf7d0"/><text x="320" y="74" text-anchor="middle" class="svg-ink" font-size="12">5 Counters: encrypt aur decrypt dono badh rahe</text>
<rect x="20" y="88" width="600" height="28" rx="6" fill="#fde68a"/><text x="320" y="108" text-anchor="middle" class="svg-ink" font-size="12">4 Route aur policy flow allow karte hain</text>
<rect x="20" y="122" width="600" height="28" rx="6" fill="#fed7aa"/><text x="320" y="142" text-anchor="middle" class="svg-ink" font-size="12">3 Phase 2 SAs maujood hain</text>
<rect x="20" y="156" width="290" height="22" rx="6" fill="#ddd6fe"/><text x="165" y="172" text-anchor="middle" class="svg-ink" font-size="12">2 Phase 1 established</text>
<rect x="330" y="156" width="290" height="22" rx="6" fill="#e2e8f0"/><text x="475" y="172" text-anchor="middle" class="svg-ink" font-size="12">1 IKE packets peer tak pahunchte hain</text>
</svg><p class="cap">Neeche se upar kaam karo; jo pehli layer fail ho wahi problem hai.</p></div>

<h3>Useful active tests</h3>
<ul>
<li><code>execute ping-options source 10.10.0.1</code> ke baad <code>execute ping 10.20.0.1</code> LAN address se test packet bhejta hai, taaki woh tunnel ke selectors aur policy se match kare.</li>
<li>Packet sniffer jaise <code>diagnose sniffer packet any 'host 198.51.100.10 and (port 500 or port 4500)' 4</code> IKE packets ko jaata aur aata dikhata hai (sniffer options ke liye <b>nse4-diag</b> dekho). Rokne ke liye Ctrl+C. ESP packets protocol ESP ki tarah dikhte hain, ya NAT-T active ho to UDP 4500 ki tarah.</li>
<li><code>diagnose vpn ike gateway clear name to-BRANCH</code> atka hua IKE gateway clear karta hai, jisse fresh negotiation force hoti hai. Production mein sambhal kar use karo kyunki yeh tunnel girata hai.</li>
</ul>

<h3>Logs padhna</h3>
<p>VPN ke under event logs tunnel up aur down events ko karan ke saath record karte hain, jaise DPD failure ya negotiation error. Build ke dauran tunnel policies par <code>logtraffic all</code> enable rakho taaki match hone wala traffic dikhe. Handover ke baad log volume woh rakho jo operations ko chahiye, lekin VPN events rakho.</p>

<div class="eg"><p><b>Worked example.</b> Naya bana tunnel summary mein selectors up dikhata hai. Engineer branch host se ping karta hai; HQ tunnel list ke counters mein decrypted count badhta hai lekin encrypted zero rehta hai. HQ firewall receive kar raha hai lekin tunnel se reply nahi kar raha. HQ ki routing table mein 10.20.0.0/24 ka route port1 se bahar point karta hai kyunki tunnel route galat device ke saath daala gaya tha. Device theek karne se encrypted counter badhta hai aur pings succeed hote hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Source set kiye bina firewall se test karna, jisse packet selectors se match nahi karta. Sirf green status padhna aur counters nahi. Asli karan mismatch ho aur baar-baar gateway clear karna. Debug chalta chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam tunnel counters dikhakar karan poochh sakta hai. Decrypt zero ke saath encrypt badhna remote end ki taraf ishara karta hai; encrypt zero ke saath decrypt badhna local return path ki taraf.</p></div>

<div class="scn"><h4>Counters ne kahani bata di</h4><p>Partner site ka tunnel poore hafte up dikha, lekin raat ki report transfer fail hoti rahi. Tunnel list mein us selector ke liye encrypted packets badh rahe the aur decrypted zero rahe. Partner admin ko pata chala ki firewall upgrade ne unka return route hata diya tha. Kyunki team ne counters padhe, partner ko call paanch minute mein hui aur exact fault bata diya.</p><p><b>Lesson:</b> counters batate hain ki kaunsi direction toot-ti hai.</p></div>

<div class="iv"><p class="q">"FortiGate par IPsec tunnel kaise verify karte ho?"</p><p>Main phase 1 ke liye summary aur IKE gateway list check karta hoon, phir phase 2 selectors, SPIs aur encrypt aur decrypt counters ke liye tunnel list. Main flow ka route aur policy confirm karta hoon aur LAN address se sourced ping se test karta hoon. Counters ek-tarfa hon to pata chal jaata hai ki kis side ko chase karna hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Layers mein verify karo: IKE, phase 1, phase 2, route, policy, counters.</li>
<li><code>diagnose vpn ike gateway list</code> phase 1 dikhata hai; <code>diagnose vpn tunnel list</code> phase 2.</li>
<li>Encrypt aur decrypt counters batate hain ki kaunsi direction fail hai.</li>
<li>Test pings LAN address se source karo taaki selectors match hon.</li>
<li>IKE aur ESP ya UDP 4500 dekhne ke liye sniffer use karo.</li>
</ul></div>
`}};export{e as default};