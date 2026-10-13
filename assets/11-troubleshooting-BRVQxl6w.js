var e={id:`troubleshoot`,h:{en:`Troubleshooting site-to-site VPNs: workflow, debug crypto and the five classic faults`,hi:`Site-to-site VPN troubleshooting: workflow, debug crypto aur paanch classic faults`},body:{en:`
<p>A car that will not start is diagnosed in order: does the key turn, does the starter crank, is there fuel, is there spark? A good mechanic never replaces the engine before checking the battery. VPNs fail in layers too, and almost every broken site-to-site tunnel is one of five faults. This chapter gives you the order, the commands, and how each fault looks.</p>

<h3>The workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="VPN troubleshooting flow">
<rect x="20" y="15" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="110" y="37" text-anchor="middle" class="svg-ink" font-size="12">1. Interesting traffic?</text><text x="110" y="55" text-anchor="middle" class="svg-muted" font-size="11">packet-tracer, NAT, route</text>
<rect x="230" y="15" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="12">2. Peer reachable?</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">ping, UDP 500/4500, ESP</text>
<rect x="440" y="15" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="37" text-anchor="middle" class="svg-ink" font-size="12">3. Phase 1 up?</text><text x="530" y="55" text-anchor="middle" class="svg-muted" font-size="11">policy, key, identity</text>
<rect x="440" y="110" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="12">4. Phase 2 up?</text><text x="530" y="150" text-anchor="middle" class="svg-muted" font-size="11">proposal, selectors, PFS</text>
<rect x="230" y="110" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="12">5. Both counters rise?</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">return path, NAT, routing</text>
<rect x="20" y="110" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="132" text-anchor="middle" class="svg-ink" font-size="12">6. App works?</text><text x="110" y="150" text-anchor="middle" class="svg-muted" font-size="11">vpn-filter, MTU, host</text>
<line x1="200" y1="40" x2="230" y2="40" stroke="#64748b"/><line x1="410" y1="40" x2="440" y2="40" stroke="#64748b"/><line x1="530" y1="65" x2="530" y2="110" stroke="#64748b"/><line x1="440" y1="135" x2="410" y2="135" stroke="#64748b"/><line x1="230" y1="135" x2="200" y2="135" stroke="#64748b"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Fix the first failing step, then re-test from step 1.</text>
</svg><p class="cap">Six questions, always in this order.</p></div>

<h3>Debugging safely</h3>
<p>Debugs on a busy ASA can flood the console. Limit them to one peer first, send output to the buffer, and always switch them off.</p>
<pre class="code"><span class="c">! ASA: only debug this peer</span>
debug crypto condition peer 100.64.52.2
debug crypto ikev2 protocol 127
debug crypto ikev2 platform 127
<span class="c">! For IKEv1 peers</span>
debug crypto ikev1 127
debug crypto ipsec 127
<span class="c">! Stop all debugs</span>
undebug all
<span class="c">! IOS equivalents</span>
debug crypto condition peer ipv4 100.64.51.2
debug crypto isakmp
debug crypto ikev2
debug crypto ipsec
<span class="c">! ASA capture of IKE and ESP on outside</span>
capture CAP-IKE interface outside match udp host 100.64.51.2 host 100.64.52.2
capture CAP-ESP interface outside match esp host 100.64.51.2 host 100.64.52.2</pre>
<p>In IKEv2 the most useful lines are the <b>notify</b> messages the peers exchange, because they name the problem directly: <code>NO_PROPOSAL_CHOSEN</code>, <code>AUTHENTICATION_FAILED</code>, <code>TS_UNACCEPTABLE</code>.</p>

<h3>The five classic faults</h3>
<table class="cmp"><tr><th>Fault</th><th>What you see</th><th>Debug clue</th><th>Fix</th></tr>
<tr><td><b>1. Proposal mismatch</b> (phase 1 or 2)</td><td>No IKE SA, or IKE SA up with no IPsec SA</td><td>IKEv2: <code>NO_PROPOSAL_CHOSEN</code>. IOS IKEv1: <code>atts are not acceptable</code></td><td>Compare <code>show crypto ikev2 sa</code> / running config line by line; align encryption, integrity, DH, PFS</td></tr>
<tr><td><b>2. PSK mismatch</b></td><td>Proposal accepted, authentication fails. IOS IKEv1 stuck in <code>MM_KEY_EXCH</code></td><td>IKEv2: <code>AUTHENTICATION_FAILED</code>. IOS: <code>%CRYPTO-4-IKMP_BAD_MESSAGE ... failed its sanity check or is malformed</code></td><td>Re-type the key on both sides; check IKEv2 local vs remote keys</td></tr>
<tr><td><b>3. Crypto ACL mismatch</b></td><td>Phase 1 up, phase 2 fails</td><td>IKEv2: <code>TS_UNACCEPTABLE</code>. ASA IKEv1: <code>no matching crypto map entry for remote proxy</code>. IOS IKEv1: <code>proxy identities not supported</code></td><td>Make ACLs exact mirrors, same prefix lengths</td></tr>
<tr><td><b>4. NAT exemption missing</b></td><td>Tunnel never starts from this side, or one-way counters</td><td><code>packet-tracer</code> shows the PAT rule, no VPN phase</td><td>Manual identity NAT above PAT (chapter 6)</td></tr>
<tr><td><b>5. Routing</b></td><td>SAs up, encaps or decaps stuck at zero on one side</td><td><code>show route</code> sends the remote LAN out the wrong interface</td><td>Route the remote LAN toward the crypto map interface or the VTI</td></tr></table>

<div class="eg"><p><b>Worked example: what the debug says for a selector mismatch.</b> The branch changed its ACL to 10.40.0.0/16. The ASA (IKEv1 peer in this case) logs:</p>
<pre class="out">Group = 100.64.52.2, IP = 100.64.52.2, Rejecting IPSec tunnel: <span class="hl">no matching crypto map entry for remote proxy 10.40.0.0/255.255.0.0/0/0 local proxy 10.30.0.0/255.255.255.0/0/0</span> on interface outside</pre>
<p>The message prints exactly what the peer proposed. Compare it with <code>show running-config access-list VPN-BR</code>: /16 versus /24. Ask the branch to return to /24 (or change both sides together).</p></div>

<h3>Walking the ticket: "the VPN is up but HQ servers do not answer"</h3>
<p>This is the module's ticket scenario. The branch says the tunnel is up. Their router shows:</p>
<pre class="out">BR# show crypto ipsec sa | include pkts
<span class="hl">    #pkts encaps: 212, #pkts encrypt: 212, #pkts digest: 212</span>
<span class="hl">    #pkts decaps: 0, #pkts decrypt: 0, #pkts verify: 0</span></pre>
<ol>
<li><b>Step 1 to 4 pass.</b> The SAs exist and BR encrypts, so policy, key and selectors are fine. Do not touch them.</li>
<li><b>Step 5 fails.</b> BR sends, nothing comes back. Check the HQ ASA: <code>show crypto ipsec sa peer 100.64.52.2</code> shows <code>decaps: 212</code> and <code>encaps: 0</code>. HQ receives and decrypts, but never encrypts the replies.</li>
<li><b>Find why HQ replies do not match the crypto map.</b> <code>packet-tracer input inside icmp 10.30.0.10 0 0 10.40.0.10</code> shows the NAT phase hitting <code>nat (inside,outside) source dynamic any interface</code> at line 1. The reply is translated to 100.64.51.2 and leaves unencrypted.</li>
<li><b>Fix.</b> Move the identity NAT rule above the PAT rule (or re-insert it as line 1). Re-run packet-tracer: NAT shows the static identity translation and a VPN encrypt phase appears.</li>
<li><b>Prove.</b> Both peers now show encaps and decaps rising.</li>
</ol>
<p>If packet-tracer had shown the right NAT but routed 10.40.0.0/24 out of <code>inside</code> (for example, a leftover static route to an old MPLS router), the fault would be routing instead. Same symptom, different cause; the workflow tells them apart.</p>

<div class="warn"><p><b>Common mistake.</b> Changing keys and proposals when the IPsec SA is already up. Once you see an IPsec SA with counters, phase 1 and phase 2 are proven. A one-way problem is always in the data path: NAT, routing, ACLs or filters.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 up and phase 2 down points to transform set / proposal, PFS or crypto ACL mismatch, never to the pre-shared key, because the key was already verified in phase 1.</p></div>

<div class="scn"><h4>The firewall upgrade that broke one partner</h4><p>After an ASA software upgrade, one old partner tunnel stopped while thirty others stayed up. <code>show crypto ikev1 sa</code> showed <code>MM_WAIT_MSG2</code> for the partner. With <code>debug crypto condition peer</code> set to the partner's address, the debug showed the partner proposing DH group 2. The new release no longer supported it. The partner moved to group 14, and the engineer added a reminder to review legacy IKEv1 peers before every upgrade.</p><p><b>Lesson:</b> conditional debugs show exactly what a peer proposes; software upgrades can remove weak algorithms that old partners still use.</p></div>

<div class="iv"><p class="q">"A site-to-site tunnel is down. Walk me through how you troubleshoot it."</p><p>Strong answer: confirm interesting traffic reaches the crypto map (packet-tracer shows NAT exemption and VPN encrypt), confirm peer reachability and that UDP 500/4500 and ESP pass, then check phase 1 (show crypto ikev2 sa or ikev1 sa) and phase 2 (show crypto ipsec sa). Use conditional debugs to read notify messages: NO_PROPOSAL_CHOSEN, AUTHENTICATION_FAILED, TS_UNACCEPTABLE. If SAs are up, compare encaps and decaps on both peers to find the broken direction, then check NAT and routing on that side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in order: traffic, reachability, phase 1, phase 2, counters, application.</li>
<li>Limit debugs with <code>debug crypto condition peer</code> and always <code>undebug all</code>.</li>
<li>IKEv2 notifies name the fault: NO_PROPOSAL_CHOSEN, AUTHENTICATION_FAILED, TS_UNACCEPTABLE.</li>
<li>Five classic faults: proposal, PSK, crypto ACL, NAT exemption, routing.</li>
<li>One-way counters mean the SAs are fine; look at NAT and routing on the silent side.</li>
</ul></div>
`,hi:`
<p>Jo car start nahi hoti use order mein diagnose karte hain: key ghoomti hai, starter crank karta hai, fuel hai, spark hai? Achha mechanic battery check kiye bina kabhi engine nahi badalta. VPNs bhi layers mein fail hote hain, aur lagbhag har toota site-to-site tunnel paanch faults mein se ek hota hai. Yeh chapter aapko order, commands, aur har fault kaisa dikhta hai yeh deta hai.</p>

<h3>Workflow</h3>
<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="VPN troubleshooting flow">
<rect x="20" y="15" width="180" height="50" rx="8" fill="#e2e8f0"/><text x="110" y="37" text-anchor="middle" class="svg-ink" font-size="12">1. Interesting traffic?</text><text x="110" y="55" text-anchor="middle" class="svg-muted" font-size="11">packet-tracer, NAT, route</text>
<rect x="230" y="15" width="180" height="50" rx="8" fill="#ddd6fe"/><text x="320" y="37" text-anchor="middle" class="svg-ink" font-size="12">2. Peer reachable?</text><text x="320" y="55" text-anchor="middle" class="svg-muted" font-size="11">ping, UDP 500/4500, ESP</text>
<rect x="440" y="15" width="180" height="50" rx="8" fill="#bae6fd"/><text x="530" y="37" text-anchor="middle" class="svg-ink" font-size="12">3. Phase 1 up?</text><text x="530" y="55" text-anchor="middle" class="svg-muted" font-size="11">policy, key, identity</text>
<rect x="440" y="110" width="180" height="50" rx="8" fill="#bbf7d0"/><text x="530" y="132" text-anchor="middle" class="svg-ink" font-size="12">4. Phase 2 up?</text><text x="530" y="150" text-anchor="middle" class="svg-muted" font-size="11">proposal, selectors, PFS</text>
<rect x="230" y="110" width="180" height="50" rx="8" fill="#fde68a"/><text x="320" y="132" text-anchor="middle" class="svg-ink" font-size="12">5. Dono counters?</text><text x="320" y="150" text-anchor="middle" class="svg-muted" font-size="11">return path, NAT, routing</text>
<rect x="20" y="110" width="180" height="50" rx="8" fill="#fed7aa"/><text x="110" y="132" text-anchor="middle" class="svg-ink" font-size="12">6. App chalti hai?</text><text x="110" y="150" text-anchor="middle" class="svg-muted" font-size="11">vpn-filter, MTU, host</text>
<line x1="200" y1="40" x2="230" y2="40" stroke="#64748b"/><line x1="410" y1="40" x2="440" y2="40" stroke="#64748b"/><line x1="530" y1="65" x2="530" y2="110" stroke="#64748b"/><line x1="440" y1="135" x2="410" y2="135" stroke="#64748b"/><line x1="230" y1="135" x2="200" y2="135" stroke="#64748b"/>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Pehla fail hone wala step fix karo, phir step 1 se dobara test karo.</text>
</svg><p class="cap">Chhe sawaal, hamesha isi order mein.</p></div>

<h3>Safely debug karna</h3>
<p>Busy ASA par debugs console ko flood kar sakte hain. Pehle unhe ek peer tak limit karo, output buffer mein bhejo, aur hamesha unhe band karo.</p>
<pre class="code"><span class="c">! ASA: sirf is peer ko debug karo</span>
debug crypto condition peer 100.64.52.2
debug crypto ikev2 protocol 127
debug crypto ikev2 platform 127
<span class="c">! IKEv1 peers ke liye</span>
debug crypto ikev1 127
debug crypto ipsec 127
<span class="c">! Saare debugs band karo</span>
undebug all
<span class="c">! IOS equivalents</span>
debug crypto condition peer ipv4 100.64.51.2
debug crypto isakmp
debug crypto ikev2
debug crypto ipsec
<span class="c">! Outside par IKE aur ESP ka ASA capture</span>
capture CAP-IKE interface outside match udp host 100.64.51.2 host 100.64.52.2
capture CAP-ESP interface outside match esp host 100.64.51.2 host 100.64.52.2</pre>
<p>IKEv2 mein sabse useful lines woh <b>notify</b> messages hain jo peers exchange karte hain, kyunki woh problem ka seedha naam lete hain: <code>NO_PROPOSAL_CHOSEN</code>, <code>AUTHENTICATION_FAILED</code>, <code>TS_UNACCEPTABLE</code>.</p>

<h3>Paanch classic faults</h3>
<table class="cmp"><tr><th>Fault</th><th>Kya dikhta hai</th><th>Debug clue</th><th>Fix</th></tr>
<tr><td><b>1. Proposal mismatch</b> (phase 1 ya 2)</td><td>IKE SA nahi, ya IKE SA up par IPsec SA nahi</td><td>IKEv2: <code>NO_PROPOSAL_CHOSEN</code>. IOS IKEv1: <code>atts are not acceptable</code></td><td><code>show crypto ikev2 sa</code> / running config line by line compare karo; encryption, integrity, DH, PFS align karo</td></tr>
<tr><td><b>2. PSK mismatch</b></td><td>Proposal accept, authentication fail. IOS IKEv1 <code>MM_KEY_EXCH</code> mein atka</td><td>IKEv2: <code>AUTHENTICATION_FAILED</code>. IOS: <code>%CRYPTO-4-IKMP_BAD_MESSAGE ... failed its sanity check or is malformed</code></td><td>Dono sides par key dobara type karo; IKEv2 local vs remote keys check karo</td></tr>
<tr><td><b>3. Crypto ACL mismatch</b></td><td>Phase 1 up, phase 2 fail</td><td>IKEv2: <code>TS_UNACCEPTABLE</code>. ASA IKEv1: <code>no matching crypto map entry for remote proxy</code>. IOS IKEv1: <code>proxy identities not supported</code></td><td>ACLs ko exact mirrors banao, same prefix lengths</td></tr>
<tr><td><b>4. NAT exemption missing</b></td><td>Is side se tunnel kabhi shuru nahi hota, ya ek-tarfa counters</td><td><code>packet-tracer</code> PAT rule dikhata hai, VPN phase nahi</td><td>PAT ke upar manual identity NAT (chapter 6)</td></tr>
<tr><td><b>5. Routing</b></td><td>SAs up, ek side par encaps ya decaps zero par atke</td><td><code>show route</code> remote LAN ko galat interface se bhejta hai</td><td>Remote LAN ko crypto map interface ya VTI ki taraf route karo</td></tr></table>

<div class="eg"><p><b>Worked example: selector mismatch par debug kya kehta hai.</b> Branch ne apni ACL 10.40.0.0/16 kar di. ASA (is case mein IKEv1 peer) log karta hai:</p>
<pre class="out">Group = 100.64.52.2, IP = 100.64.52.2, Rejecting IPSec tunnel: <span class="hl">no matching crypto map entry for remote proxy 10.40.0.0/255.255.0.0/0/0 local proxy 10.30.0.0/255.255.255.0/0/0</span> on interface outside</pre>
<p>Message exactly print karta hai ki peer ne kya propose kiya. Ise <code>show running-config access-list VPN-BR</code> se compare karo: /16 versus /24. Branch se /24 par wapas aane ko kaho (ya dono sides saath badlo).</p></div>

<h3>Ticket walk: "VPN up hai lekin HQ servers jawab nahi dete"</h3>
<p>Yeh module ka ticket scenario hai. Branch kehti hai tunnel up hai. Unka router dikhata hai:</p>
<pre class="out">BR# show crypto ipsec sa | include pkts
<span class="hl">    #pkts encaps: 212, #pkts encrypt: 212, #pkts digest: 212</span>
<span class="hl">    #pkts decaps: 0, #pkts decrypt: 0, #pkts verify: 0</span></pre>
<ol>
<li><b>Step 1 se 4 pass.</b> SAs hain aur BR encrypt karta hai, isliye policy, key aur selectors theek hain. Unhe mat chhuo.</li>
<li><b>Step 5 fail.</b> BR bhejta hai, kuch wapas nahi aata. HQ ASA check karo: <code>show crypto ipsec sa peer 100.64.52.2</code> <code>decaps: 212</code> aur <code>encaps: 0</code> dikhata hai. HQ receive aur decrypt karta hai, lekin replies kabhi encrypt nahi karta.</li>
<li><b>Dhoondo ki HQ replies crypto map se match kyun nahi karte.</b> <code>packet-tracer input inside icmp 10.30.0.10 0 0 10.40.0.10</code> dikhata hai ki NAT phase line 1 par <code>nat (inside,outside) source dynamic any interface</code> se hit ho raha hai. Reply 100.64.51.2 mein translate hokar bina encrypt hue nikal jaata hai.</li>
<li><b>Fix.</b> Identity NAT rule ko PAT rule ke upar le jao (ya line 1 ki tarah dobara insert karo). packet-tracer dobara chalao: NAT static identity translation dikhata hai aur VPN encrypt phase aa jaata hai.</li>
<li><b>Saabit karo.</b> Ab dono peers par encaps aur decaps badh rahe hain.</li>
</ol>
<p>Agar packet-tracer sahi NAT dikhata lekin 10.40.0.0/24 ko <code>inside</code> se route karta (jaise purane MPLS router ka bacha hua static route), to fault routing hota. Same symptom, alag cause; workflow unhe alag karta hai.</p>

<div class="warn"><p><b>Common galti.</b> IPsec SA pehle se up hone par keys aur proposals badalna. Jab aap counters wala IPsec SA dekh lo, phase 1 aur phase 2 saabit ho chuke hain. Ek-tarfa problem hamesha data path mein hoti hai: NAT, routing, ACLs ya filters.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 up aur phase 2 down transform set / proposal, PFS ya crypto ACL mismatch ki taraf ishaara karta hai, kabhi pre-shared key ki taraf nahi, kyunki key phase 1 mein pehle hi verify ho chuki hai.</p></div>

<div class="scn"><h4>Firewall upgrade jisne ek partner tod diya</h4><p>ASA software upgrade ke baad ek purana partner tunnel ruk gaya jabki tees doosre up rahe. <code>show crypto ikev1 sa</code> partner ke liye <code>MM_WAIT_MSG2</code> dikha raha tha. Partner ke address par <code>debug crypto condition peer</code> set karke debug ne dikhaya ki partner DH group 2 propose kar raha tha. Nayi release ab use support nahi karti thi. Partner group 14 par aaya, aur engineer ne har upgrade se pehle legacy IKEv1 peers review karne ka reminder joda.</p><p><b>Seekh:</b> conditional debugs exactly dikhate hain ki peer kya propose karta hai; software upgrades woh weak algorithms hata sakte hain jo purane partners abhi bhi use karte hain.</p></div>

<div class="iv"><p class="q">"Ek site-to-site tunnel down hai. Batao aap use kaise troubleshoot karoge."</p><p>Strong answer: confirm karo ki interesting traffic crypto map tak pahunchta hai (packet-tracer NAT exemption aur VPN encrypt dikhaye), peer reachability aur UDP 500/4500 aur ESP pass hona confirm karo, phir phase 1 (show crypto ikev2 sa ya ikev1 sa) aur phase 2 (show crypto ipsec sa) check karo. Notify messages padhne ke liye conditional debugs use karo: NO_PROPOSAL_CHOSEN, AUTHENTICATION_FAILED, TS_UNACCEPTABLE. Agar SAs up hain, to tooti direction dhoondhne ke liye dono peers par encaps aur decaps compare karo, phir us side par NAT aur routing check karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Order mein troubleshoot karo: traffic, reachability, phase 1, phase 2, counters, application.</li>
<li>Debugs ko <code>debug crypto condition peer</code> se limit karo aur hamesha <code>undebug all</code>.</li>
<li>IKEv2 notifies fault ka naam lete hain: NO_PROPOSAL_CHOSEN, AUTHENTICATION_FAILED, TS_UNACCEPTABLE.</li>
<li>Paanch classic faults: proposal, PSK, crypto ACL, NAT exemption, routing.</li>
<li>Ek-tarfa counters ka matlab SAs theek hain; chup side par NAT aur routing dekho.</li>
</ul></div>
`}};export{e as default};