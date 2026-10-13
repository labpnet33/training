var e={id:`ipsec-ike`,h:{en:`IPsec and IKE: how overlay tunnels stay private`,hi:`IPsec aur IKE: overlay tunnels private kaise rehte hain`},body:{en:`
<p>When the overlay runs across the public Internet, anybody who can see the packets could read or alter them. SD-WAN solves this with <b>IPsec</b>, a standard set of protocols that encrypts and authenticates traffic between two endpoints. In this chapter you learn the concepts at the level an SD-WAN engineer needs. You will not configure IPsec by hand in these labs, because the Versa Controller and Director negotiate and manage the tunnels for you, but you must understand what is being negotiated and what its failure looks like.</p>

<h3>Analogy: a courier with a sealed, signed envelope</h3>
<p>Two offices agree a secret code for the day. Before any parcel moves, they first check each other's identity at the door (<b>authentication</b>), then agree the day's code (<b>key exchange</b>). Every parcel is then locked with that code (<b>encryption</b>) and carries a tamper-evident seal (<b>integrity</b>). Tomorrow they agree a new code so a stolen code is useless after a while (<b>rekey</b>).</p>

<h3>What IPsec provides</h3>
<ul>
<li><b>Confidentiality:</b> encryption, so eavesdroppers see scrambled bytes.</li>
<li><b>Integrity:</b> a hash or authenticated encryption detects any modification in transit.</li>
<li><b>Authentication:</b> each end proves who it is (certificates or pre-shared keys).</li>
<li><b>Anti-replay:</b> sequence numbers stop an attacker from re-sending captured packets.</li>
</ul>

<h3>Two phases: IKE and ESP</h3>
<p><b>IKE</b> (Internet Key Exchange, usually version 2, IKEv2) is the negotiation protocol. It runs on UDP port 500, or UDP 4500 when a NAT device is in the path (NAT traversal). IKE does two jobs: it authenticates both peers and creates a secure control channel (the <b>IKE security association, SA</b>), and it then creates one or more <b>IPsec SAs (child SAs)</b> that protect the actual user traffic. <b>ESP</b> (Encapsulating Security Payload, IP protocol 50) is the format of the protected data packets. When NAT is present, ESP is wrapped in UDP 4500.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IKE then ESP">
<rect x="20" y="50" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="80" text-anchor="middle" class="svg-ink" font-size="13">Branch VOS</text>
<rect x="500" y="50" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="13">Remote VOS</text>
<line x1="140" y1="65" x2="500" y2="65" stroke="#64748b"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">1. IKE: authenticate and agree keys (UDP 500 / 4500)</text>
<line x1="140" y1="85" x2="500" y2="85" stroke="#64748b"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">2. IPsec SA created (child SA, keys, algorithms)</text>
<rect x="140" y="130" width="360" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. ESP tunnel: user packets encrypted and sealed</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Rekey: new keys before the lifetime ends, with no traffic drop</text>
</svg><p class="cap">IKE negotiates; ESP carries the data. If step 1 fails, no tunnel; if step 3 packets are blocked, tunnel looks up but traffic does not flow.</p></div>

<h3>Tunnel mode and what is inside the packet</h3>
<p>SD-WAN uses <b>tunnel mode</b>: the entire original IP packet is encrypted and a new outer IP header is added. Compare the headers when PC1 (10.1.1.10) talks to PC3 (10.1.3.10):</p>
<pre class="out">Original packet:   src 10.1.1.10        dst 10.1.3.10        (private LAN addresses)
After encapsulation:
  Outer IP header: src 203.0.113.6      dst 203.0.113.14     (WAN addresses, visible)
  ESP header + encrypted payload (original packet inside, unreadable)
  ESP trailer + integrity check</pre>
<p>The outer header uses the WAN addresses, which is why the underlay must be able to route them. The added overhead (outer IP, ESP, padding) reduces the usable payload. A common result is that a full 1500-byte packet no longer fits, so the system lowers the <b>MTU</b> or adjusts TCP maximum segment size (MSS). MTU problems cause the classic symptom "small pings work, large file transfers hang".</p>

<h3>How Versa uses it</h3>
<p>In Versa, branches build <b>IPsec tunnels</b> on each WAN transport towards other sites and the headend. Keys and tunnel parameters are distributed by the control plane, so an administrator does not type pre-shared keys for every pair of sites. The Controller is also the route reflector for the overlay routes (MP-BGP, covered in the architecture chapter). In the course lab model, a branch has <b>one tunnel per WAN interface</b>, and the tunnel is shown as up or down in <code>show orgs org Acme sd-wan brief</code>. The model does not display IKE messages; the real VOS has detailed commands and logs for IKE and IPsec state.</p>

<table class="cmp"><tr><th>Symptom</th><th>Likely IPsec area</th><th>Where to look first</th></tr>
<tr><td>No tunnel at all, ping to the peer address works</td><td>IKE not completing: identity, authentication or peer address mismatch</td><td>Organization, site-id, Controller address</td></tr>
<tr><td>Tunnel flaps every few minutes</td><td>Rekey problems or an unstable underlay</td><td>Underlay loss, clock, lifetime settings</td></tr>
<tr><td>Tunnel up, large transfers hang</td><td>MTU or fragmentation</td><td>Path MTU, MSS clamp</td></tr>
<tr><td>Tunnel up behind NAT, traffic one-way</td><td>UDP 4500 or NAT state</td><td>NAT device, firewall rules for UDP 500/4500</td></tr>
</table>

<div class="eg"><p><b>Worked example: overhead.</b> Original packet 1400 bytes. Tunnel mode ESP with AES adds about 60 to 80 bytes (outer IP 20, ESP and IV roughly 16 to 24, padding, trailer, integrity 16, and UDP 8 when NAT is present). The packet on the wire is about 1470 to 1480 bytes, which still fits 1500 but leaves little room. A 1500-byte original would be fragmented or dropped if "do not fragment" is set. That is why SD-WAN engineers talk about MTU on day one.</p></div>

<div class="note"><p><b>Defensive view.</b> Use strong modern algorithms (AES-GCM, SHA-2, Diffie-Hellman groups from the current recommendation lists), keep the lifetime reasonable, protect keys and certificates, and monitor for tunnels that flap or negotiate unexpectedly. Never allow weak legacy algorithms just because an old device requires it.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Blaming IPsec when the underlay is down: no ping to the peer means IKE cannot even start. (2) Blocking UDP 500 or 4500 on an upstream firewall. (3) Treating "tunnel up" as proof that applications work: policy, routes and MTU still matter.</p></div>
<div class="exam"><p><b>Exam trap.</b> IKE and ESP are different: IKE negotiates (UDP 500/4500), ESP carries data (protocol 50). Tunnel mode encrypts the whole original packet; transport mode protects only the payload and is not the SD-WAN norm.</p></div>

<div class="scn"><h4>Ping works but file copies hang</h4><p>After a new tunnel came up, users in Kolkata reported that small web pages loaded but a 20 MB report download stalled at zero. Pings of 64 bytes worked. The engineer sent pings with the do-not-fragment bit and increasing sizes and found that anything above 1400 bytes was dropped somewhere in the carrier path. The branch interface was changed to clamp TCP MSS to a lower value and the downloads recovered.</p><p><b>Lesson:</b> encapsulation costs bytes. When "small works, big fails", think MTU.</p></div>

<div class="iv"><p class="q">"Explain how an IPsec VPN is established and what protects the data."</p><p>Strong answer: peers first run IKE (UDP 500, or 4500 with NAT-T) to authenticate and create an IKE SA, then negotiate child SAs. Data is carried by ESP in tunnel mode, encrypted and integrity-protected with anti-replay. Keys are rekeyed on a lifetime. Mention that in SD-WAN the controller automates peering and key distribution, and that MTU overhead must be handled.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec gives confidentiality, integrity, authentication and anti-replay for overlay tunnels.</li>
<li>IKEv2 negotiates over UDP 500 or 4500; ESP carries the protected data in tunnel mode.</li>
<li>The outer header uses WAN addresses, so the underlay must route them.</li>
<li>Encapsulation adds overhead; MTU and MSS problems show as "small works, large fails".</li>
<li>In Versa the control plane automates tunnel parameters; the course model shows one tunnel per WAN interface.</li>
</ul></div>
`,hi:`
<p>Jab overlay public Internet par chalta hai, to jo bhi packets dekh sakta hai woh unhe padh ya badal sakta hai. SD-WAN iska solution <b>IPsec</b> se karta hai, jo standard protocols ka set hai aur do endpoints ke beech traffic ko encrypt aur authenticate karta hai. Is chapter mein aap concepts us level par seekhoge jo SD-WAN engineer ko chahiye. In labs mein aap IPsec haath se configure nahi karoge, kyunki Versa Controller aur Director tunnels negotiate aur manage karte hain, lekin aapko samajhna hoga ki kya negotiate ho raha hai aur uski failure kaisi dikhti hai.</p>

<h3>Analogy: sealed aur signed envelope wala courier</h3>
<p>Do offices din ka ek secret code agree karte hain. Koi parcel chalne se pehle woh gate par ek dusre ki identity check karte hain (<b>authentication</b>), phir din ka code agree karte hain (<b>key exchange</b>). Har parcel us code se lock hota hai (<b>encryption</b>) aur uspar tamper-evident seal hoti hai (<b>integrity</b>). Kal woh naya code agree karte hain taaki chori hua code thodi der baad bekaar ho jaye (<b>rekey</b>).</p>

<h3>IPsec kya deta hai</h3>
<ul>
<li><b>Confidentiality:</b> encryption, taaki eavesdroppers ko scrambled bytes dikhein.</li>
<li><b>Integrity:</b> hash ya authenticated encryption transit mein kisi bhi modification ko detect karta hai.</li>
<li><b>Authentication:</b> har end prove karta hai ki woh kaun hai (certificates ya pre-shared keys).</li>
<li><b>Anti-replay:</b> sequence numbers attacker ko captured packets dobara bhejne se rokte hain.</li>
</ul>

<h3>Do phases: IKE aur ESP</h3>
<p><b>IKE</b> (Internet Key Exchange, aam taur par version 2, IKEv2) negotiation protocol hai. Yeh UDP port 500 par chalta hai, ya UDP 4500 par jab path mein NAT device ho (NAT traversal). IKE do kaam karta hai: dono peers ko authenticate karta hai aur ek secure control channel banata hai (<b>IKE security association, SA</b>), aur phir ek ya zyada <b>IPsec SAs (child SAs)</b> banata hai jo actual user traffic ko protect karte hain. <b>ESP</b> (Encapsulating Security Payload, IP protocol 50) protected data packets ka format hai. NAT hone par ESP UDP 4500 mein wrap hota hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="IKE phir ESP">
<rect x="20" y="50" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="80" y="80" text-anchor="middle" class="svg-ink" font-size="13">Branch VOS</text>
<rect x="500" y="50" width="120" height="50" rx="8" fill="#bbf7d0"/><text x="560" y="80" text-anchor="middle" class="svg-ink" font-size="13">Remote VOS</text>
<line x1="140" y1="65" x2="500" y2="65" stroke="#64748b"/><text x="320" y="60" text-anchor="middle" class="svg-ink" font-size="12">1. IKE: authenticate aur keys agree (UDP 500 / 4500)</text>
<line x1="140" y1="85" x2="500" y2="85" stroke="#64748b"/><text x="320" y="100" text-anchor="middle" class="svg-ink" font-size="12">2. IPsec SA ban gaya (child SA, keys, algorithms)</text>
<rect x="140" y="130" width="360" height="40" rx="8" fill="#ddd6fe"/><text x="320" y="155" text-anchor="middle" class="svg-ink" font-size="13">3. ESP tunnel: user packets encrypted aur sealed</text>
<text x="320" y="200" text-anchor="middle" class="svg-muted" font-size="12">Rekey: lifetime khatam hone se pehle naye keys, traffic drop nahi</text>
</svg><p class="cap">IKE negotiate karta hai; ESP data le jaata hai. Step 1 fail ho to tunnel nahi; step 3 ke packets block hon to tunnel up dikhta hai lekin traffic nahi chalta.</p></div>

<h3>Tunnel mode aur packet ke andar kya hai</h3>
<p>SD-WAN <b>tunnel mode</b> use karta hai: poora original IP packet encrypt hota hai aur naya outer IP header add hota hai. Jab PC1 (10.1.1.10) PC3 (10.1.3.10) se baat karta hai, headers compare karo:</p>
<pre class="out">Original packet:   src 10.1.1.10        dst 10.1.3.10        (private LAN addresses)
After encapsulation:
  Outer IP header: src 203.0.113.6      dst 203.0.113.14     (WAN addresses, visible)
  ESP header + encrypted payload (original packet inside, unreadable)
  ESP trailer + integrity check</pre>
<p>Outer header WAN addresses use karta hai, isliye underlay ko unhe route karna aana chahiye. Jo overhead add hota hai (outer IP, ESP, padding) woh usable payload ko kam karta hai. Aam result yeh hai ki poora 1500-byte packet fit nahi hota, isliye system <b>MTU</b> kam karta hai ya TCP maximum segment size (MSS) adjust karta hai. MTU problems ka classic symptom hai "chhote ping chalte hain, bade file transfers hang".</p>

<h3>Versa ise kaise use karta hai</h3>
<p>Versa mein branches har WAN transport par dusri sites aur headend ki taraf <b>IPsec tunnels</b> banati hain. Keys aur tunnel parameters control plane distribute karta hai, isliye administrator har pair of sites ke liye pre-shared keys type nahi karta. Controller overlay routes (MP-BGP, architecture chapter mein) ka route reflector bhi hai. Course lab model mein branch ke paas <b>har WAN interface par ek tunnel</b> hota hai, aur tunnel <code>show orgs org Acme sd-wan brief</code> mein up ya down dikhta hai. Model IKE messages display nahi karta; real VOS mein IKE aur IPsec state ke detailed commands aur logs hote hain.</p>

<table class="cmp"><tr><th>Symptom</th><th>Likely IPsec area</th><th>Pehle kahan dekho</th></tr>
<tr><td>Tunnel bilkul nahi, peer address ko ping chalta hai</td><td>IKE complete nahi ho raha: identity, authentication ya peer address mismatch</td><td>Organization, site-id, Controller address</td></tr>
<tr><td>Tunnel har kuch minute mein flap</td><td>Rekey problems ya unstable underlay</td><td>Underlay loss, clock, lifetime settings</td></tr>
<tr><td>Tunnel up, bade transfers hang</td><td>MTU ya fragmentation</td><td>Path MTU, MSS clamp</td></tr>
<tr><td>NAT ke peeche tunnel up, traffic one-way</td><td>UDP 4500 ya NAT state</td><td>NAT device, UDP 500/4500 ke firewall rules</td></tr>
</table>

<div class="eg"><p><b>Worked example: overhead.</b> Original packet 1400 bytes. AES ke saath tunnel mode ESP lagbhag 60 se 80 bytes add karta hai (outer IP 20, ESP aur IV lagbhag 16 se 24, padding, trailer, integrity 16, aur NAT hone par UDP 8). Wire par packet lagbhag 1470 se 1480 bytes ka hota hai, jo 1500 mein fit hota hai lekin jagah kam bachti hai. 1500-byte original fragment ho jaata ya drop ho jaata agar "do not fragment" set ho. Isi liye SD-WAN engineers pehle din se MTU ki baat karte hain.</p></div>

<div class="note"><p><b>Defensive view.</b> Strong modern algorithms use karo (AES-GCM, SHA-2, current recommendation lists ke Diffie-Hellman groups), lifetime reasonable rakho, keys aur certificates protect karo, aur aise tunnels monitor karo jo flap karte hain ya unexpectedly negotiate hote hain. Sirf isliye weak legacy algorithms allow mat karo ki koi purana device maangta hai.</p></div>

<div class="warn"><p><b>Common mistakes.</b> (1) Underlay down ho tab IPsec ko blame karna: peer ko ping nahi to IKE start hi nahi ho sakta. (2) Upstream firewall par UDP 500 ya 4500 block kar dena. (3) "Tunnel up" ko proof maan lena ki applications chalti hain: policy, routes aur MTU abhi bhi matter karte hain.</p></div>
<div class="exam"><p><b>Exam trap.</b> IKE aur ESP alag hain: IKE negotiate karta hai (UDP 500/4500), ESP data le jaata hai (protocol 50). Tunnel mode poora original packet encrypt karta hai; transport mode sirf payload protect karta hai aur SD-WAN ka norm nahi hai.</p></div>

<div class="scn"><h4>Ping chalta hai lekin file copy hang</h4><p>Naya tunnel up aane ke baad Kolkata ke users ne report kiya ki chhote web pages load hote hain lekin 20 MB report download zero par ruk jaata hai. 64-byte pings chalte the. Engineer ne do-not-fragment bit ke saath badhte sizes ke pings bheje aur paaya ki 1400 bytes se upar kuch bhi carrier path mein kahin drop ho raha tha. Branch interface par TCP MSS ko kam value par clamp kiya gaya aur downloads recover ho gaye.</p><p><b>Seekh:</b> encapsulation bytes kharch karta hai. "Chhota chalta hai, bada fail" ho to MTU socho.</p></div>

<div class="iv"><p class="q">"IPsec VPN kaise establish hota hai aur data ko kya protect karta hai, samjhao."</p><p>Strong answer: peers pehle IKE chalate hain (UDP 500, ya NAT-T ke saath 4500) authenticate karne aur IKE SA banane ke liye, phir child SAs negotiate karte hain. Data ESP tunnel mode mein jaata hai, encrypted aur integrity-protected, anti-replay ke saath. Keys lifetime par rekey hoti hain. Bolo ki SD-WAN mein controller peering aur key distribution automate karta hai, aur MTU overhead handle karna padta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec overlay tunnels ko confidentiality, integrity, authentication aur anti-replay deta hai.</li>
<li>IKEv2 UDP 500 ya 4500 par negotiate karta hai; ESP tunnel mode mein protected data le jaata hai.</li>
<li>Outer header WAN addresses use karta hai, isliye underlay ko unhe route karna chahiye.</li>
<li>Encapsulation overhead add karta hai; MTU aur MSS problems "chhota chalta, bada fail" jaise dikhti hain.</li>
<li>Versa mein control plane tunnel parameters automate karta hai; course model har WAN interface par ek tunnel dikhata hai.</li>
</ul></div>
`}};export{e as default};