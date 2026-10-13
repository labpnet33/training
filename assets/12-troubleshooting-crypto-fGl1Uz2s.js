var e={id:`troubleshooting`,h:{en:`Troubleshooting crypto: proposals, keys, certificates, clocks and the data plane`,hi:`Crypto troubleshooting: proposals, keys, certificates, clocks aur data plane`},body:{en:`<p>A doctor does not guess. They check pulse, then blood pressure, then run tests, each step ruling out a whole group of causes. A failed VPN deserves the same discipline. Almost every crypto outage falls into one of five buckets, and they happen in a fixed order, because a tunnel is built in a fixed order: reach the peer, agree on IKE, authenticate, build the child SA, then move data. Work through the buckets in that order and you will find the fault quickly instead of changing random settings.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Crypto troubleshooting workflow">
<rect x="20" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="75" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 Reach</text><text x="75" y="62" text-anchor="middle" class="svg-muted" font-size="12">UDP 500/4500</text>
<rect x="145" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="200" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Proposal</text><text x="200" y="62" text-anchor="middle" class="svg-muted" font-size="12">IKE_SA_INIT</text>
<rect x="270" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="325" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Auth</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="12">PSK / cert</text>
<rect x="395" y="20" width="110" height="56" rx="8" fill="#fed7aa"/><text x="450" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Child SA</text><text x="450" y="62" text-anchor="middle" class="svg-muted" font-size="12">ESP, TS, PFS</text>
<rect x="520" y="20" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="575" y="44" text-anchor="middle" class="svg-ink" font-size="13">5 Data</text><text x="575" y="62" text-anchor="middle" class="svg-muted" font-size="12">encaps/decaps</text>
<line x1="130" y1="48" x2="145" y2="48" stroke="#64748b" stroke-width="2"/><line x1="255" y1="48" x2="270" y2="48" stroke="#64748b" stroke-width="2"/><line x1="380" y1="48" x2="395" y2="48" stroke="#64748b" stroke-width="2"/><line x1="505" y1="48" x2="520" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">no reply</text>
<text x="200" y="110" text-anchor="middle" class="svg-muted" font-size="12">NO_PROPOSAL</text>
<text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">AUTH_FAILED</text>
<text x="450" y="110" text-anchor="middle" class="svg-muted" font-size="12">TS_UNACCEPT</text>
<text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">decaps 0</text>
<rect x="120" y="150" width="400" height="70" rx="8" fill="#e2e8f0"/>
<text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Cross-cutting: clock/NTP, certificate dates,</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">CRL/OCSP reachability, MTU and fragmentation</text>
</svg><p class="cap">Five buckets in build order, each with a signature error, plus the cross-cutting checks that break several stages at once.</p></div>

<h3>Your toolkit</h3>
<table class="cmp"><tr><th>Question</th><th>IOS XE command</th><th>ASA command</th></tr>
<tr><td>Is the IKE SA up?</td><td><code>show crypto ikev2 sa</code></td><td><code>show crypto ikev2 sa</code></td></tr>
<tr><td>Are packets encrypted and decrypted?</td><td><code>show crypto ipsec sa</code></td><td><code>show crypto ipsec sa peer 198.51.100.2</code></td></tr>
<tr><td>One-line status per peer</td><td><code>show crypto session</code></td><td><code>show vpn-sessiondb l2l</code></td></tr>
<tr><td>Why did negotiation fail?</td><td><code>debug crypto ikev2</code></td><td><code>debug crypto ikev2 protocol 127</code></td></tr>
<tr><td>Is the certificate valid?</td><td><code>show crypto pki certificates verbose</code></td><td><code>show crypto ca certificates</code></td></tr>
<tr><td>Is the clock right?</td><td><code>show clock detail</code>, <code>show ntp status</code></td><td><code>show clock</code>, <code>show ntp status</code></td></tr></table>
<p>On a busy router, limit debugs to one peer first with <code>debug crypto condition peer ipv4 198.51.100.2</code>, and turn them off with <code>undebug all</code> when you finish.</p>

<h3>Bucket 1: can the peers reach each other?</h3>
<p>If <code>show crypto ikev2 sa</code> is empty and the debug shows R1 retransmitting IKE_SA_INIT with no answer, the problem is below crypto. Check that UDP 500 and UDP 4500 are allowed, and ESP (IP protocol 50) if there is no NAT, on every firewall and ISP edge between the peers, and that the tunnel destination is routed via the right exit.</p>

<h3>Bucket 2: proposal mismatch</h3>
<pre class="out">R1# debug crypto ikev2
IKEv2:(SESSION ID = 7,SA ID = 1):Received Packet [From 198.51.100.2:500/To 203.0.113.1:500/VRF i0:f0]
IKEv2 IKE_SA_INIT Exchange REQUEST
Payload contents:
 SA KE N NOTIFY(NAT_DETECTION_SOURCE_IP) NOTIFY(NAT_DETECTION_DESTINATION_IP)
<span class="hl">IKEv2-ERROR:(SESSION ID = 7,SA ID = 1):: Failed to find a matching policy</span>
IKEv2:(SESSION ID = 7,SA ID = 1):Received Policies:
<span class="hl">Proposal 1:  AES-CBC-256 SHA256 SHA256 DH_GROUP_2048_MODP/Group 14</span>
IKEv2:(SESSION ID = 7,SA ID = 1):Expected Policies:
<span class="hl">Proposal 1:  AES-GCM-256 SHA384 DH_GROUP_384_ECP/Group 20</span>
IKEv2:(SESSION ID = 7,SA ID = 1):Sending Packet ... NOTIFY(NO_PROPOSAL_CHOSEN)</pre>
<p>The debug prints both lists. Compare them field by field: encryption, integrity, PRF and DH group. Here R2 offers AES-CBC with group 14 while R1 only accepts AES-GCM with group 20. Fix one side so at least one proposal matches exactly. The same message in the IKE_AUTH response instead means the <b>ESP transform set</b> (child SA) does not match.</p>

<h3>Bucket 3: authentication failure</h3>
<pre class="out"><span class="hl">IKEv2-ERROR:(SESSION ID = 8,SA ID = 1):: Failed to authenticate the IKE SA</span>
IKEv2:(SESSION ID = 8,SA ID = 1):Verification of peer's authentication data FAILED
IKEv2:(SESSION ID = 8,SA ID = 1):Sending Packet ... NOTIFY(AUTHENTICATION_FAILED)</pre>
<p>With PSKs, the key R1 uses to <b>verify</b> R2 must equal the key R2 uses to <b>sign</b>. Remember the asymmetric keys from chapter 9: <code>pre-shared-key local</code> on R1 must match <code>pre-shared-key remote</code> on R2. Also check the IKE identity: if the profile matches <code>identity remote address 198.51.100.2</code> but R2 sends an FQDN identity, no profile matches. With certificates, go to the PKI checks below.</p>

<h3>Certificate and clock problems</h3>
<pre class="out"><span class="hl">%PKI-3-CERTIFICATE_INVALID_NOT_YET_VALID: Certificate chain validation has failed. The certificate (SN: 3A1F07) is not yet valid Validity period starts on 09:00:00 UTC Sep 1 2026</span>
R2# show clock detail
<span class="hl">*00:04:12.311 UTC Mon Mar 1 1993</span>
No time source</pre>
<p>R2 rebooted, has no NTP, and believes it is 1993, so every certificate looks "not yet valid". The asterisk means the clock is not authoritative. Configure NTP (authenticated, as in sec-aaa-mgmt), wait for <code>show ntp status</code> to say synchronised, and clear the SA. The opposite case is <b>CERTIFICATE_INVALID_EXPIRED</b>: renew the certificate, ideally with auto-enrollment (<code>auto-enroll 80</code> renews at 80 percent of lifetime). A third classic is <b>revocation</b>: if the trustpoint says <code>revocation-check crl</code> and the CRL distribution point is unreachable, validation fails. Fix reachability, or configure <code>revocation-check crl none</code>, which tries the CRL but accepts the certificate if the CRL cannot be fetched; do that only as a documented, temporary decision.</p>

<div class="eg"><p><b>Worked example: which date wins?</b> A certificate is valid from 2026-09-01 09:00 UTC to 2027-09-01 09:00 UTC. R2's clock reads 2026-09-01 08:55 UTC because it runs five minutes slow. Result: "not yet valid" for five minutes after every re-enrollment. Clock skew of even a few minutes matters for freshly issued certificates, which is why NTP comes before PKI.</p></div>

<h3>Bucket 4: the child SA</h3>
<p>If the IKE SA is READY but there is no IPsec SA, look for <b>NO_PROPOSAL_CHOSEN</b> in IKE_AUTH (transform set mismatch), <b>TS_UNACCEPTABLE</b> (traffic selectors do not mirror each other, typical with crypto maps where R1's ACL says 10.1.1.0/24 to 10.2.2.0/24 but R2's says 10.2.0.0/16 to 10.1.1.0/24), or a <b>PFS group mismatch</b> that appears only at rekey, often exactly one lifetime after the tunnel first came up. VTIs avoid most selector problems because both sides use any-to-any selectors.</p>

<h3>Bucket 5: the data plane</h3>
<pre class="out">R1# show crypto ipsec sa | include peer|pkts
   current_peer 198.51.100.2 port 500
<span class="hl">    #pkts encaps: 842, #pkts encrypt: 842, #pkts digest: 842</span>
<span class="hl">    #pkts decaps: 0, #pkts decrypt: 0, #pkts verify: 0</span></pre>
<p>R1 encrypts but receives nothing back. Read the counters on <b>both</b> peers. If R2 shows decaps rising and encaps at zero, R2 has no route back into the tunnel, or its LAN return traffic is being NATed before encryption (missing NAT exemption). If R2 shows decaps zero too, ESP is dropped in the path, so check whether NAT-T should be in use or an ISP filters protocol 50. Large-packet failures with small pings working point to MTU: set <code>ip tcp adjust-mss 1360</code> on the tunnel and allow ICMP "fragmentation needed" messages.</p>

<pre class="code"><span class="c">! R2: the fix for a missing return route over the VTI</span>
ip route 10.1.1.0 255.255.255.0 Tunnel0
<span class="c">! then clear and re-test</span>
clear crypto session remote 203.0.113.1</pre>

<h3>Remote access (TLS) quick checks</h3>
<p>For Secure Client users on ASA1, the same logic applies with TLS words: "certificate validation failure" means the client does not trust or cannot validate the ASA certificate (expired, wrong name, untrusted chain); a failure after sign-in usually means an address pool, group policy or authorisation problem, not crypto.</p>

<div class="warn"><p><b>Common mistake.</b> Running <code>debug crypto ikev2</code> on only one side. The <b>responder</b> usually logs the precise reason, while the initiator just sees a notify. Always read both ends, and never leave debugs running on a production headend.</p></div>
<div class="exam"><p><b>Exam trap.</b> "The IKE SA is up, so the crypto is fine" is wrong. A READY IKE SA with no child SA points to transform sets, selectors or PFS; a child SA with decaps zero points to routing, NAT, filtering or the far side.</p></div>

<div class="scn"><h4>The tunnel that died every 24 hours</h4><p>A branch tunnel came up every morning after a reboot and then failed a day later. The IKE SA recovered, but traffic stopped until someone cleared the session. <code>debug crypto ikev2</code> on the hub, captured at the next failure, showed NO_PROPOSAL_CHOSEN during a CREATE_CHILD_SA exchange. The hub profile had <code>set pfs group20</code> while the branch had no PFS configured; the first child SA is created inside IKE_AUTH without its own DH, so it worked, but the rekey required PFS and failed. Adding <code>set pfs group20</code> on the branch fixed it.</p><p><b>Lesson:</b> failures that follow the SA lifetime are rekey problems, and PFS is the first suspect.</p></div>

<div class="iv"><p class="q">"A site-to-site tunnel is down. Walk me through how you troubleshoot it."</p><p>Strong answer: follow the build order. Check reachability for UDP 500/4500 and ESP; read <code>show crypto ikev2 sa</code>; debug on the responder for NO_PROPOSAL_CHOSEN or AUTHENTICATION_FAILED; for certificates check the clock, NTP, validity dates and CRL reachability; if the IKE SA is up, check transform sets, traffic selectors and PFS; finally compare encaps and decaps counters on both peers for routing, NAT exemption and MTU. Mention scoping debugs to one peer.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Troubleshoot in build order: reach, proposal, authentication, child SA, data.</li>
<li>NO_PROPOSAL_CHOSEN means mismatched algorithms; AUTHENTICATION_FAILED means wrong PSK, identity or certificate.</li>
<li>Certificate errors are often clock errors: fix NTP before touching the PKI.</li>
<li>TS_UNACCEPTABLE means traffic selectors do not mirror; failures at every lifetime point to PFS or rekey settings.</li>
<li>Encaps without decaps means the return path, NAT exemption, ESP filtering or MTU, so read both peers' counters.</li>
</ul></div>
`,hi:`<p>Doctor andaaza nahi lagata. Pehle pulse check karta hai, phir blood pressure, phir tests, aur har step causes ka ek poora group rule out karta hai. Fail hua VPN bhi isi discipline ka haqdaar hai. Lagbhag har crypto outage paanch buckets mein se kisi ek mein aata hai, aur woh ek fixed order mein hote hain, kyunki tunnel ek fixed order mein banta hai: peer tak pahuncho, IKE par agree karo, authenticate karo, child SA banao, phir data chalao. In buckets ko usi order mein check karo aur random settings badalne ki jagah fault jaldi mil jaayega.</p>

<div class="dia"><svg viewBox="0 0 640 250" role="img" aria-label="Crypto troubleshooting workflow">
<rect x="20" y="20" width="110" height="56" rx="8" fill="#bae6fd"/><text x="75" y="44" text-anchor="middle" class="svg-ink" font-size="13">1 Reach</text><text x="75" y="62" text-anchor="middle" class="svg-muted" font-size="12">UDP 500/4500</text>
<rect x="145" y="20" width="110" height="56" rx="8" fill="#ddd6fe"/><text x="200" y="44" text-anchor="middle" class="svg-ink" font-size="13">2 Proposal</text><text x="200" y="62" text-anchor="middle" class="svg-muted" font-size="12">IKE_SA_INIT</text>
<rect x="270" y="20" width="110" height="56" rx="8" fill="#fde68a"/><text x="325" y="44" text-anchor="middle" class="svg-ink" font-size="13">3 Auth</text><text x="325" y="62" text-anchor="middle" class="svg-muted" font-size="12">PSK / cert</text>
<rect x="395" y="20" width="110" height="56" rx="8" fill="#fed7aa"/><text x="450" y="44" text-anchor="middle" class="svg-ink" font-size="13">4 Child SA</text><text x="450" y="62" text-anchor="middle" class="svg-muted" font-size="12">ESP, TS, PFS</text>
<rect x="520" y="20" width="110" height="56" rx="8" fill="#bbf7d0"/><text x="575" y="44" text-anchor="middle" class="svg-ink" font-size="13">5 Data</text><text x="575" y="62" text-anchor="middle" class="svg-muted" font-size="12">encaps/decaps</text>
<line x1="130" y1="48" x2="145" y2="48" stroke="#64748b" stroke-width="2"/><line x1="255" y1="48" x2="270" y2="48" stroke="#64748b" stroke-width="2"/><line x1="380" y1="48" x2="395" y2="48" stroke="#64748b" stroke-width="2"/><line x1="505" y1="48" x2="520" y2="48" stroke="#64748b" stroke-width="2"/>
<text x="75" y="110" text-anchor="middle" class="svg-muted" font-size="12">reply nahi</text>
<text x="200" y="110" text-anchor="middle" class="svg-muted" font-size="12">NO_PROPOSAL</text>
<text x="325" y="110" text-anchor="middle" class="svg-muted" font-size="12">AUTH_FAILED</text>
<text x="450" y="110" text-anchor="middle" class="svg-muted" font-size="12">TS_UNACCEPT</text>
<text x="575" y="110" text-anchor="middle" class="svg-muted" font-size="12">decaps 0</text>
<rect x="120" y="150" width="400" height="70" rx="8" fill="#e2e8f0"/>
<text x="320" y="178" text-anchor="middle" class="svg-ink" font-size="13">Cross-cutting: clock/NTP, certificate dates,</text>
<text x="320" y="200" text-anchor="middle" class="svg-ink" font-size="13">CRL/OCSP reachability, MTU aur fragmentation</text>
</svg><p class="cap">Build order mein paanch buckets, har ek ka signature error, aur cross-cutting checks jo ek saath kai stages tod dete hain.</p></div>

<h3>Aapka toolkit</h3>
<table class="cmp"><tr><th>Sawaal</th><th>IOS XE command</th><th>ASA command</th></tr>
<tr><td>Kya IKE SA up hai?</td><td><code>show crypto ikev2 sa</code></td><td><code>show crypto ikev2 sa</code></td></tr>
<tr><td>Kya packets encrypt aur decrypt ho rahe hain?</td><td><code>show crypto ipsec sa</code></td><td><code>show crypto ipsec sa peer 198.51.100.2</code></td></tr>
<tr><td>Har peer ka one-line status</td><td><code>show crypto session</code></td><td><code>show vpn-sessiondb l2l</code></td></tr>
<tr><td>Negotiation kyun fail hua?</td><td><code>debug crypto ikev2</code></td><td><code>debug crypto ikev2 protocol 127</code></td></tr>
<tr><td>Kya certificate valid hai?</td><td><code>show crypto pki certificates verbose</code></td><td><code>show crypto ca certificates</code></td></tr>
<tr><td>Kya clock sahi hai?</td><td><code>show clock detail</code>, <code>show ntp status</code></td><td><code>show clock</code>, <code>show ntp status</code></td></tr></table>
<p>Busy router par pehle debugs ko ek peer tak limit karo <code>debug crypto condition peer ipv4 198.51.100.2</code> se, aur kaam khatam hone par <code>undebug all</code> se band karo.</p>

<h3>Bucket 1: kya peers ek doosre tak pahunch sakte hain?</h3>
<p>Agar <code>show crypto ikev2 sa</code> khaali hai aur debug dikhata hai ki R1 bina jawab ke IKE_SA_INIT retransmit kar raha hai, to problem crypto ke neeche hai. Check karo ki peers ke beech har firewall aur ISP edge par UDP 500 aur UDP 4500 allowed hain, aur NAT na ho to ESP (IP protocol 50) bhi, aur tunnel destination sahi exit se routed hai.</p>

<h3>Bucket 2: proposal mismatch</h3>
<pre class="out">R1# debug crypto ikev2
IKEv2:(SESSION ID = 7,SA ID = 1):Received Packet [From 198.51.100.2:500/To 203.0.113.1:500/VRF i0:f0]
IKEv2 IKE_SA_INIT Exchange REQUEST
Payload contents:
 SA KE N NOTIFY(NAT_DETECTION_SOURCE_IP) NOTIFY(NAT_DETECTION_DESTINATION_IP)
<span class="hl">IKEv2-ERROR:(SESSION ID = 7,SA ID = 1):: Failed to find a matching policy</span>
IKEv2:(SESSION ID = 7,SA ID = 1):Received Policies:
<span class="hl">Proposal 1:  AES-CBC-256 SHA256 SHA256 DH_GROUP_2048_MODP/Group 14</span>
IKEv2:(SESSION ID = 7,SA ID = 1):Expected Policies:
<span class="hl">Proposal 1:  AES-GCM-256 SHA384 DH_GROUP_384_ECP/Group 20</span>
IKEv2:(SESSION ID = 7,SA ID = 1):Sending Packet ... NOTIFY(NO_PROPOSAL_CHOSEN)</pre>
<p>Debug dono lists print karta hai. Unhe field by field compare karo: encryption, integrity, PRF aur DH group. Yahan R2 group 14 ke saath AES-CBC offer kar raha hai jabki R1 sirf group 20 ke saath AES-GCM accept karta hai. Ek side theek karo taaki kam se kam ek proposal exactly match kare. Agar yahi message IKE_AUTH response mein aaye, to matlab <b>ESP transform set</b> (child SA) match nahi kar raha.</p>

<h3>Bucket 3: authentication failure</h3>
<pre class="out"><span class="hl">IKEv2-ERROR:(SESSION ID = 8,SA ID = 1):: Failed to authenticate the IKE SA</span>
IKEv2:(SESSION ID = 8,SA ID = 1):Verification of peer's authentication data FAILED
IKEv2:(SESSION ID = 8,SA ID = 1):Sending Packet ... NOTIFY(AUTHENTICATION_FAILED)</pre>
<p>PSKs ke saath, jo key R1 R2 ko <b>verify</b> karne ke liye use karta hai woh us key ke barabar honi chahiye jo R2 <b>sign</b> karne ke liye use karta hai. Chapter 9 ki asymmetric keys yaad karo: R1 par <code>pre-shared-key local</code> R2 ke <code>pre-shared-key remote</code> se match hona chahiye. IKE identity bhi check karo: agar profile <code>identity remote address 198.51.100.2</code> match karta hai lekin R2 FQDN identity bhejta hai, to koi profile match nahi hota. Certificates ke saath, neeche PKI checks par jao.</p>

<h3>Certificate aur clock problems</h3>
<pre class="out"><span class="hl">%PKI-3-CERTIFICATE_INVALID_NOT_YET_VALID: Certificate chain validation has failed. The certificate (SN: 3A1F07) is not yet valid Validity period starts on 09:00:00 UTC Sep 1 2026</span>
R2# show clock detail
<span class="hl">*00:04:12.311 UTC Mon Mar 1 1993</span>
No time source</pre>
<p>R2 reboot hua, uske paas NTP nahi hai, aur woh samajhta hai ki 1993 chal raha hai, isliye har certificate "not yet valid" dikhta hai. Asterisk ka matlab clock authoritative nahi hai. NTP configure karo (authenticated, jaise sec-aaa-mgmt mein), <code>show ntp status</code> ke synchronised bolne ka intezaar karo, aur SA clear karo. Ulta case <b>CERTIFICATE_INVALID_EXPIRED</b> hai: certificate renew karo, behtar ho auto-enrollment se (<code>auto-enroll 80</code> lifetime ke 80 percent par renew karta hai). Teesra classic <b>revocation</b> hai: agar trustpoint <code>revocation-check crl</code> kehta hai aur CRL distribution point reachable nahi, to validation fail hota hai. Reachability theek karo, ya <code>revocation-check crl none</code> configure karo, jo CRL try karta hai lekin CRL fetch na ho paaye to certificate accept kar leta hai; yeh sirf documented, temporary decision ke roop mein karo.</p>

<div class="eg"><p><b>Worked example: kaunsi date jeetegi?</b> Ek certificate 2026-09-01 09:00 UTC se 2027-09-01 09:00 UTC tak valid hai. R2 ka clock 2026-09-01 08:55 UTC padhta hai kyunki woh paanch minute slow chalta hai. Result: har re-enrollment ke baad paanch minute tak "not yet valid". Freshly issued certificates ke liye kuch minute ka clock skew bhi matter karta hai, isliye NTP PKI se pehle aata hai.</p></div>

<h3>Bucket 4: child SA</h3>
<p>Agar IKE SA READY hai lekin IPsec SA nahi, to dekho IKE_AUTH mein <b>NO_PROPOSAL_CHOSEN</b> (transform set mismatch), <b>TS_UNACCEPTABLE</b> (traffic selectors ek doosre ka mirror nahi, crypto maps ke saath typical jahan R1 ki ACL 10.1.1.0/24 se 10.2.2.0/24 kehti hai lekin R2 ki 10.2.0.0/16 se 10.1.1.0/24), ya <b>PFS group mismatch</b> jo sirf rekey par dikhta hai, aksar tunnel pehli baar up hone ke exactly ek lifetime baad. VTIs zyada tar selector problems se bachate hain kyunki dono sides any-to-any selectors use karti hain.</p>

<h3>Bucket 5: data plane</h3>
<pre class="out">R1# show crypto ipsec sa | include peer|pkts
   current_peer 198.51.100.2 port 500
<span class="hl">    #pkts encaps: 842, #pkts encrypt: 842, #pkts digest: 842</span>
<span class="hl">    #pkts decaps: 0, #pkts decrypt: 0, #pkts verify: 0</span></pre>
<p>R1 encrypt kar raha hai lekin wapas kuch nahi aa raha. <b>Dono</b> peers par counters padho. Agar R2 par decaps badh rahe hain aur encaps zero hai, to R2 ke paas tunnel mein wapas route nahi hai, ya uska LAN return traffic encryption se pehle NAT ho raha hai (NAT exemption missing). Agar R2 par bhi decaps zero hai, to ESP raste mein drop ho raha hai, isliye check karo ki NAT-T use hona chahiye ya ISP protocol 50 filter kar raha hai. Chhote pings chalein lekin bade packets fail hon to MTU ki taraf ishara hai: tunnel par <code>ip tcp adjust-mss 1360</code> set karo aur ICMP "fragmentation needed" messages allow karo.</p>

<pre class="code"><span class="c">! R2: VTI par missing return route ka fix</span>
ip route 10.1.1.0 255.255.255.0 Tunnel0
<span class="c">! phir clear karo aur re-test karo</span>
clear crypto session remote 203.0.113.1</pre>

<h3>Remote access (TLS) quick checks</h3>
<p>ASA1 par Secure Client users ke liye yahi logic TLS words ke saath lagta hai: "certificate validation failure" ka matlab client ASA certificate ko trust nahi karta ya validate nahi kar pa raha (expired, galat naam, untrusted chain); sign-in ke baad failure aam taur par address pool, group policy ya authorisation problem hai, crypto nahi.</p>

<div class="warn"><p><b>Common mistake.</b> <code>debug crypto ikev2</code> sirf ek side par chalana. <b>Responder</b> aam taur par sahi reason log karta hai, jabki initiator ko sirf ek notify dikhta hai. Hamesha dono ends padho, aur production headend par debugs kabhi chalte mat chhodo.</p></div>
<div class="exam"><p><b>Exam trap.</b> "IKE SA up hai, isliye crypto theek hai" galat hai. Bina child SA ke READY IKE SA transform sets, selectors ya PFS ki taraf ishara karta hai; decaps zero wala child SA routing, NAT, filtering ya far side ki taraf.</p></div>

<div class="scn"><h4>Woh tunnel jo har 24 ghante mein marta tha</h4><p>Ek branch tunnel har subah reboot ke baad up hota aur ek din baad fail ho jaata. IKE SA recover ho jaata, lekin traffic tab tak ruka rehta jab tak koi session clear na kare. Agle failure par hub par capture kiye gaye <code>debug crypto ikev2</code> ne CREATE_CHILD_SA exchange ke dauraan NO_PROPOSAL_CHOSEN dikhaya. Hub profile mein <code>set pfs group20</code> tha jabki branch par koi PFS configured nahi tha; pehla child SA IKE_AUTH ke andar apne DH ke bina banta hai, isliye woh chal gaya, lekin rekey ko PFS chahiye tha aur woh fail hua. Branch par <code>set pfs group20</code> jodne se fix ho gaya.</p><p><b>Lesson:</b> jo failures SA lifetime ke hisaab se aate hain woh rekey problems hain, aur PFS pehla suspect hai.</p></div>

<div class="iv"><p class="q">"Ek site-to-site tunnel down hai. Mujhe batao aap ise kaise troubleshoot karoge."</p><p>Strong answer: build order follow karo. UDP 500/4500 aur ESP ki reachability check karo; <code>show crypto ikev2 sa</code> padho; NO_PROPOSAL_CHOSEN ya AUTHENTICATION_FAILED ke liye responder par debug karo; certificates ke liye clock, NTP, validity dates aur CRL reachability check karo; agar IKE SA up hai, to transform sets, traffic selectors aur PFS check karo; aakhir mein routing, NAT exemption aur MTU ke liye dono peers par encaps aur decaps counters compare karo. Debugs ko ek peer tak scope karna mention karo.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Build order mein troubleshoot karo: reach, proposal, authentication, child SA, data.</li>
<li>NO_PROPOSAL_CHOSEN ka matlab algorithms mismatch; AUTHENTICATION_FAILED ka matlab galat PSK, identity ya certificate.</li>
<li>Certificate errors aksar clock errors hote hain: PKI chhoone se pehle NTP theek karo.</li>
<li>TS_UNACCEPTABLE ka matlab traffic selectors mirror nahi; har lifetime par failures PFS ya rekey settings ki taraf ishara karte hain.</li>
<li>Decaps ke bina encaps ka matlab return path, NAT exemption, ESP filtering ya MTU, isliye dono peers ke counters padho.</li>
</ul></div>
`}};export{e as default};