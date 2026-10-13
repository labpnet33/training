var e={id:`phase1`,h:{en:`IKE phase 1: peers, authentication, proposals and DH groups`,hi:`IKE phase 1: peers, authentication, proposals aur DH groups`},body:{en:`
<p>Phase 1 is where two FortiGates meet, prove who they are and agree how to protect their conversation. If phase 1 does not complete, nothing else can happen, so most "tunnel will not come up" tickets are phase 1 tickets. In this chapter you learn every phase 1 setting that matters, in FortiOS 7.x, and what values to choose.</p>

<h3>What phase 1 negotiates</h3>
<ul>
<li><b>Who talks to whom:</b> the local interface, the remote gateway address (or dynamic for dial-up), and optionally the identities used.</li>
<li><b>Authentication method:</b> a pre-shared key, or digital certificates (signature).</li>
<li><b>IKE version:</b> IKEv1 (main or aggressive mode) or IKEv2.</li>
<li><b>Proposal:</b> the encryption and integrity (hash/PRF) algorithms for the IKE SA.</li>
<li><b>Diffie-Hellman group:</b> how the shared secret is generated.</li>
<li><b>Lifetime:</b> how long the IKE SA lasts before rekeying.</li>
</ul>

<h3>IKEv1 or IKEv2?</h3>
<p><b>IKEv2</b> is simpler and more efficient: fewer messages, built-in NAT traversal and liveness, and support for EAP. It is the right choice for new tunnels when both peers support it. <b>IKEv1</b> remains for interoperability with older devices. IKEv1 has <b>main mode</b> (six messages, identities protected) and <b>aggressive mode</b> (three messages, faster but exposes identities and is used mainly for dial-up with peer-ID matching). A tunnel only forms if both sides use the same IKE version.</p>

<h3>Proposals, DH groups and key lifetime</h3>
<p>A proposal is a pair such as <code>aes256-sha256</code> (AES with a 256-bit key and SHA-256), or an authenticated-encryption suite such as <code>aes256gcm-prfsha384</code>. Choose current algorithms: <b>AES-256 or AES-GCM, SHA-2 family</b>, and <b>DH groups 14 or higher</b>, preferably the elliptic-curve groups 19, 20 or 21. Avoid DES, 3DES, MD5, SHA-1 and DH groups 1, 2 and 5. Both peers must share <b>at least one</b> proposal and one DH group, because each side offers a list and the responder picks a match. The IKE SA <code>keylife</code> defaults to 86400 seconds (24 hours); the peers do not need an identical value because they rekey at the shorter one, but matching values keep logs tidy.</p>

<h3>Authentication: pre-shared key or certificate</h3>
<p>A <b>pre-shared key (PSK)</b> is a secret configured identically on both sides. It is simple, but it must be long and random (twenty characters or more), unique per tunnel, and kept out of tickets and chat. <b>Certificates</b> (<code>authmethod signature</code> with a local certificate and a trusted CA) scale better, avoid shared secrets and let you revoke a single device. For many sites, a certificate-based design is the stronger answer. This module uses placeholders for every secret.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Phase 1 on FGT-HQ for the tunnel to the Pune branch:</p>
<pre class="code"><span class="c"># FGT-HQ: phase 1 interface (reference)</span>
config vpn ipsec phase1-interface
    edit "to-BRANCH"
        set interface "port1"
        set ike-version 2
        set peertype any
        set remote-gw 198.51.100.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set psksecret "Placeholder-Long-Random-Secret"
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
        set keylife 86400
    next
end</pre>
<p>The branch uses the mirror image: <code>remote-gw 203.0.113.10</code>, the same version, proposal, DH group, key and lifetime. <code>interface</code> is the physical or VLAN interface that faces the internet. <code>peertype any</code> accepts any peer ID; tighten this in production with <code>localid</code> and a peer ID or certificate match when you can.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Phase 1 settings that must match">
<rect x="40" y="30" width="230" height="130" rx="10" fill="#bbf7d0"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="13">FGT-HQ phase 1</text>
<text x="155" y="80" text-anchor="middle" class="svg-muted" font-size="12">IKEv2, AES-GCM, DH 20</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="12">PSK or certificate</text><text x="155" y="120" text-anchor="middle" class="svg-muted" font-size="12">remote-gw = branch IP</text>
<rect x="370" y="30" width="230" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="13">FGT-BR phase 1</text>
<text x="485" y="80" text-anchor="middle" class="svg-muted" font-size="12">IKEv2, AES-GCM, DH 20</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="12">same PSK or certificate</text><text x="485" y="120" text-anchor="middle" class="svg-muted" font-size="12">remote-gw = HQ IP</text>
<line x1="270" y1="95" x2="370" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">must agree</text>
</svg><p class="cap">Everything except the remote gateway address must agree.</p></div>

<h3>What happens on the wire</h3>
<p>The initiator sends an IKE message to UDP 500 of the peer's address offering its proposals. The responder checks the offer against its own phase 1 configuration and replies with the choice, then both sides exchange key material and authenticate. With IKEv2 this is the <b>IKE_SA_INIT</b> exchange followed by <b>IKE_AUTH</b>, which also creates the first child SA. If the responder finds no phase 1 that matches, it logs an error such as "no proposal chosen" or a key mismatch message and the exchange fails.</p>

<div class="eg"><p><b>Worked example.</b> HQ offers aes256gcm-prfsha384 with DH 20. The branch is configured with aes256-sha256 with DH 14. Nothing is in common, so negotiation fails. The fix is to change one side (or add a second proposal on both) so that they share one proposal and one DH group. Which side to change is a policy decision: always move the weaker side up to the stronger standard, never the other way around.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Different IKE versions on the two sides. A pre-shared key that was pasted with a trailing space. Choosing DH group 2 or SHA-1 because an old device needs it and forgetting to remove it later. Using the same PSK for every branch.</p></div>
<div class="exam"><p><b>Exam trap.</b> The exam may ask which values must be identical in phase 1. The answer: IKE version, authentication (PSK or certificate trust), at least one common proposal, and the DH group. Lifetimes, DPD settings and descriptive names do not need to match.</p></div>

<div class="scn"><h4>The tunnel that only broke at 3 am</h4><p>A branch tunnel dropped every night around 3 am for a minute and then returned. The team found the two sides had different IKE SA lifetimes and one side initiated the rekey over a flaky ISP path. They aligned the lifetimes, enabled DPD, and the nightly blip disappeared.</p><p><b>Lesson:</b> small differences in lifetime and liveness settings are a common source of intermittent outages.</p></div>

<div class="iv"><p class="q">"Which phase 1 parameters must match on both sides?"</p><p>The IKE version, the authentication method and credential (same PSK or trusted certificates), at least one common encryption and integrity proposal, and a common Diffie-Hellman group. Identities may need to match too when they are checked. Lifetimes and DPD settings do not have to be identical. I would also say I prefer IKEv2, AES-GCM or AES-256 with SHA-2, and DH 19 or 20.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 authenticates peers and protects the IKE conversation.</li>
<li>Match IKE version, credential, proposal and DH group.</li>
<li>Prefer IKEv2, AES-GCM or AES-256 with SHA-2, and DH 14 or higher (19, 20, 21).</li>
<li>Use certificates or long unique PSKs, never a shared weak secret.</li>
<li>The branch configuration mirrors the HQ one with the remote gateway swapped.</li>
</ul></div>
`,hi:`
<p>Phase 1 woh jagah hai jahan do FortiGates milte hain, apni pehchaan prove karte hain aur apni baatcheet protect karne ka tareeka agree karte hain. Phase 1 complete na ho to aage kuch nahi ho sakta, isliye zyadatar "tunnel up nahi ho raha" tickets phase 1 tickets hote hain. Is chapter mein aap FortiOS 7.x ki har important phase 1 setting seekhoge aur kaunsi values chunni hain.</p>

<h3>Phase 1 kya negotiate karta hai</h3>
<ul>
<li><b>Kaun kisse baat karega:</b> local interface, remote gateway address (ya dial-up ke liye dynamic), aur optional roop se use hone wali identities.</li>
<li><b>Authentication method:</b> pre-shared key, ya digital certificates (signature).</li>
<li><b>IKE version:</b> IKEv1 (main ya aggressive mode) ya IKEv2.</li>
<li><b>Proposal:</b> IKE SA ke liye encryption aur integrity (hash/PRF) algorithms.</li>
<li><b>Diffie-Hellman group:</b> shared secret kaise banta hai.</li>
<li><b>Lifetime:</b> IKE SA rekey hone se pehle kitni der chalta hai.</li>
</ul>

<h3>IKEv1 ya IKEv2?</h3>
<p><b>IKEv2</b> simple aur efficient hai: kam messages, built-in NAT traversal aur liveness, aur EAP support. Dono peers support karte hon to naye tunnels ke liye yahi sahi choice hai. <b>IKEv1</b> purane devices ke saath interoperability ke liye bacha hai. IKEv1 mein <b>main mode</b> (chhe messages, identities protected) aur <b>aggressive mode</b> (teen messages, tez lekin identities expose karta hai aur zyadatar peer-ID matching ke saath dial-up mein use hota hai) hote hain. Tunnel tabhi banta hai jab dono sides same IKE version use karein.</p>

<h3>Proposals, DH groups aur key lifetime</h3>
<p>Proposal ek pair hota hai jaise <code>aes256-sha256</code> (256-bit key ke saath AES aur SHA-256), ya authenticated-encryption suite jaise <code>aes256gcm-prfsha384</code>. Current algorithms chuno: <b>AES-256 ya AES-GCM, SHA-2 family</b>, aur <b>DH groups 14 ya usse upar</b>, behtar hai elliptic-curve groups 19, 20 ya 21. DES, 3DES, MD5, SHA-1 aur DH groups 1, 2 aur 5 se bacho. Dono peers ko <b>kam se kam ek</b> proposal aur ek DH group share karna chahiye, kyunki har side list offer karti hai aur responder match chunta hai. IKE SA <code>keylife</code> default 86400 seconds (24 ghante) hai; peers ki value identical hona zaroori nahi kyunki woh chhoti value par rekey karte hain, lekin matching values logs saaf rakhti hain.</p>

<h3>Authentication: pre-shared key ya certificate</h3>
<p><b>Pre-shared key (PSK)</b> ek secret hai jo dono sides par identical configure hota hai. Yeh simple hai, lekin lamba aur random (bees characters ya zyada), har tunnel ke liye unique, aur tickets aur chat se door hona chahiye. <b>Certificates</b> (<code>authmethod signature</code> local certificate aur trusted CA ke saath) better scale karte hain, shared secrets se bachate hain aur ek device ko revoke karne dete hain. Kai sites ke liye certificate-based design stronger jawab hai. Is module mein har secret ke liye placeholders hain.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<p>Pune branch ke tunnel ke liye FGT-HQ par phase 1:</p>
<pre class="code"><span class="c"># FGT-HQ: phase 1 interface (reference)</span>
config vpn ipsec phase1-interface
    edit "to-BRANCH"
        set interface "port1"
        set ike-version 2
        set peertype any
        set remote-gw 198.51.100.10
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set psksecret "Placeholder-Long-Random-Secret"
        set nattraversal enable
        set dpd on-idle
        set dpd-retryinterval 10
        set dpd-retrycount 3
        set keylife 86400
    next
end</pre>
<p>Branch mirror image use karta hai: <code>remote-gw 203.0.113.10</code>, same version, proposal, DH group, key aur lifetime. <code>interface</code> woh physical ya VLAN interface hai jo internet ki taraf hai. <code>peertype any</code> koi bhi peer ID accept karta hai; production mein jahan ho sake ise <code>localid</code> aur peer ID ya certificate match se tight karo.</p>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Phase 1 settings jo match honi chahiye">
<rect x="40" y="30" width="230" height="130" rx="10" fill="#bbf7d0"/><text x="155" y="55" text-anchor="middle" class="svg-ink" font-size="13">FGT-HQ phase 1</text>
<text x="155" y="80" text-anchor="middle" class="svg-muted" font-size="12">IKEv2, AES-GCM, DH 20</text><text x="155" y="100" text-anchor="middle" class="svg-muted" font-size="12">PSK ya certificate</text><text x="155" y="120" text-anchor="middle" class="svg-muted" font-size="12">remote-gw = branch IP</text>
<rect x="370" y="30" width="230" height="130" rx="10" fill="#bbf7d0"/><text x="485" y="55" text-anchor="middle" class="svg-ink" font-size="13">FGT-BR phase 1</text>
<text x="485" y="80" text-anchor="middle" class="svg-muted" font-size="12">IKEv2, AES-GCM, DH 20</text><text x="485" y="100" text-anchor="middle" class="svg-muted" font-size="12">same PSK ya certificate</text><text x="485" y="120" text-anchor="middle" class="svg-muted" font-size="12">remote-gw = HQ IP</text>
<line x1="270" y1="95" x2="370" y2="95" stroke="#64748b" stroke-width="3"/><text x="320" y="85" text-anchor="middle" class="svg-accent" font-size="12">agree hona chahiye</text>
</svg><p class="cap">Remote gateway address ko chhodkar baaki sab agree hona chahiye.</p></div>

<h3>Wire par kya hota hai</h3>
<p>Initiator peer ke address ke UDP 500 par apne proposals offer karte hue IKE message bhejta hai. Responder offer ko apni phase 1 configuration se check karta hai aur choice ke saath reply karta hai, phir dono key material exchange karte hain aur authenticate karte hain. IKEv2 mein yeh <b>IKE_SA_INIT</b> exchange hai jiske baad <b>IKE_AUTH</b>, jo pehla child SA bhi banata hai. Responder ko koi matching phase 1 na mile to woh "no proposal chosen" jaisa error ya key mismatch message log karta hai aur exchange fail ho jaata hai.</p>

<div class="eg"><p><b>Worked example.</b> HQ DH 20 ke saath aes256gcm-prfsha384 offer karta hai. Branch DH 14 ke saath aes256-sha256 par configured hai. Kuch common nahi, isliye negotiation fail hoti hai. Fix hai ek side badalna (ya dono par doosra proposal add karna) taaki ek proposal aur ek DH group share ho. Kaunsi side badalni hai yeh policy decision hai: hamesha kamzor side ko stronger standard tak upar le jao, ulta kabhi nahi.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Dono sides par alag IKE versions. Pre-shared key jo trailing space ke saath paste hui. Purane device ki wajah se DH group 2 ya SHA-1 chunna aur baad mein hatana bhool jaana. Har branch ke liye same PSK use karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Exam poochh sakta hai ki phase 1 mein kaun si values identical honi chahiye. Jawab: IKE version, authentication (PSK ya certificate trust), kam se kam ek common proposal, aur DH group. Lifetimes, DPD settings aur descriptive names match hone zaroori nahi.</p></div>

<div class="scn"><h4>Tunnel jo sirf raat 3 baje toota</h4><p>Ek branch tunnel har raat 3 baje ke aas-paas ek minute ke liye gir jaata tha aur phir wapas aa jaata tha. Team ne dekha ki dono sides ke IKE SA lifetimes alag the aur ek side ne flaky ISP path par rekey initiate kiya. Unhone lifetimes align kiye, DPD enable kiya, aur raat ka blip khatam ho gaya.</p><p><b>Lesson:</b> lifetime aur liveness settings ke chhote differences intermittent outages ka common source hain.</p></div>

<div class="iv"><p class="q">"Phase 1 ke kaun se parameters dono sides par match hone chahiye?"</p><p>IKE version, authentication method aur credential (same PSK ya trusted certificates), kam se kam ek common encryption aur integrity proposal, aur common Diffie-Hellman group. Identities check hoti hon to woh bhi match honi chahiye. Lifetimes aur DPD settings identical hona zaroori nahi. Main yeh bhi kahunga ki main IKEv2, AES-GCM ya SHA-2 ke saath AES-256, aur DH 19 ya 20 prefer karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 1 peers ko authenticate karta hai aur IKE baatcheet protect karta hai.</li>
<li>IKE version, credential, proposal aur DH group match karo.</li>
<li>IKEv2, AES-GCM ya SHA-2 ke saath AES-256, aur DH 14 ya upar (19, 20, 21) prefer karo.</li>
<li>Certificates ya lambi unique PSKs use karo, kabhi shared kamzor secret nahi.</li>
<li>Branch configuration HQ ka mirror hai, remote gateway swap karke.</li>
</ul></div>
`}};export{e as default};