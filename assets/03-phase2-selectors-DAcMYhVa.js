var e={id:`phase2-selectors`,h:{en:`IKE phase 2: proposals, PFS and traffic selectors`,hi:`IKE phase 2: proposals, PFS aur traffic selectors`},body:{en:`
<p>Once phase 1 has built a trusted channel, phase 2 decides <b>which traffic</b> is protected and <b>how</b>. Phase 2 is where selectors live, and selector mismatches are one of the most common causes of a tunnel that is "up" at phase 1 but passes no traffic. In IKEv2 phase 2 is a <b>child SA</b>; FortiOS still calls the configuration object <code>phase2-interface</code>.</p>

<h3>What phase 2 negotiates</h3>
<ul>
<li><b>Proposal:</b> the algorithms that protect the data, for example <code>aes256gcm</code> or <code>aes256-sha256</code>. Same advice as before: AES-256 or AES-GCM, SHA-2, no DES, 3DES, MD5 or SHA-1.</li>
<li><b>PFS (Perfect Forward Secrecy):</b> an extra Diffie-Hellman exchange for each rekey, so that stealing one key does not expose past or future traffic. Enable it and choose a DH group of 14 or higher (for example 20). Both sides must agree on PFS and the group.</li>
<li><b>Lifetime:</b> in seconds, default 43200 (12 hours). The shorter side rekeys first.</li>
<li><b>Selectors:</b> the source and destination subnets that this child SA will protect.</li>
</ul>

<h3>Selectors: the heart of phase 2</h3>
<p>A <b>selector</b> (also called a proxy ID or traffic selector) is a pair: local subnet and remote subnet. Traffic is allowed into the IPsec SA only if it matches. The two sides must have <b>mirror-image selectors</b>: what is "source" for HQ is "destination" for the branch. If HQ says 10.10.0.0/24 to 10.20.0.0/24, the branch must say 10.20.0.0/24 to 10.10.0.0/24, or both can use the wide setting <code>0.0.0.0/0</code> to <code>0.0.0.0/0</code>.</p>
<ul>
<li><b>Wide selectors (0.0.0.0/0).</b> The FortiGate default. With route-based VPNs the routing table and firewall policy decide what really enters the tunnel, so wide selectors are simple and robust. They are also the right choice when both peers are FortiGates.</li>
<li><b>Specific selectors.</b> Required when the peer is another vendor that uses strict proxy IDs, or in some policy-driven designs. They must mirror exactly. Several subnets need either several phase 2 entries (one SA each) or an address group, depending on version and peer support.</li>
</ul>
<p>With IKEv1 a selector mismatch usually shows in the log as a failed phase 2. With IKEv2 the responder narrows the proposed traffic selectors when it can; if nothing acceptable remains, the exchange fails with a traffic-selector error. Either way the symptom is the same: phase 1 is up, phase 2 is not.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># FGT-HQ: phase 2 with wide selectors (reference)</span>
config vpn ipsec phase2-interface
    edit "to-BRANCH-p2"
        set phase1name "to-BRANCH"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set keylifeseconds 43200
        set auto-negotiate enable
    next
end

<span class="c"># Alternative: specific selectors, mirrored on the branch</span>
config vpn ipsec phase2-interface
    edit "to-BRANCH-p2"
        set phase1name "to-BRANCH"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set src-subnet 10.10.0.0 255.255.255.0
        set dst-subnet 10.20.0.0 255.255.255.0
    next
end</pre>
<p>On the branch the two subnets are reversed: <code>src-subnet 10.20.0.0</code> and <code>dst-subnet 10.10.0.0</code>. <code>auto-negotiate enable</code> makes the FortiGate bring the SA up on its own without waiting for traffic, and <code>keepalive</code> helps keep an SA alive on an idle tunnel. Selectors can also be address objects (<code>src-addr-type name</code> with <code>src-name</code>) which keeps the configuration readable.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Mirror selectors">
<rect x="30" y="40" width="250" height="100" rx="10" fill="#bae6fd"/><text x="155" y="68" text-anchor="middle" class="svg-ink" font-size="13">HQ selector</text><text x="155" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.10.0.0/24</text><text x="155" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.20.0.0/24</text>
<rect x="360" y="40" width="250" height="100" rx="10" fill="#bae6fd"/><text x="485" y="68" text-anchor="middle" class="svg-ink" font-size="13">Branch selector</text><text x="485" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.20.0.0/24</text><text x="485" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.10.0.0/24</text>
<line x1="280" y1="80" x2="360" y2="100" stroke="#64748b" stroke-width="2"/><line x1="280" y1="100" x2="360" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Source and destination are swapped on the other side</text>
</svg><p class="cap">Selectors must be mirror images of each other.</p></div>

<h3>Phase 1 up, phase 2 down: how to think</h3>
<ol>
<li>Is the phase 2 proposal in common, including PFS and the DH group?</li>
<li>Do the selectors mirror each other, or are both wide?</li>
<li>Is the phase 1 name in <code>phase1name</code> correct?</li>
<li>Does the other side use a different IKE version? (Then phase 1 would not be up either.)</li>
<li>Is there an SA but no traffic? Then the problem is routing or policy, covered in the next chapter.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> HQ uses wide selectors. The branch, a different vendor, insists on 10.20.0.0/24 to 10.10.0.0/24. A strict peer rejects a proposal of 0.0.0.0/0. The fix is to set specific mirror selectors on the FortiGate: HQ src 10.10.0.0/24 and dst 10.20.0.0/24. The tunnel then negotiates. If the branch later adds 10.30.0.0/24, a second selector must be added on both ends, otherwise traffic to 10.30.0.0/24 will not go through the tunnel.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Entering the same subnets in the same order on both sides, instead of reversing them. Forgetting that adding a new LAN needs a selector change on a strict peer. PFS enabled on one side only. Leaving phase 2 proposals with old algorithms for compatibility.</p></div>
<div class="exam"><p><b>Exam trap.</b> When phase 1 is established but the tunnel does not pass traffic, the exam wants you to think of phase 2 selector or proposal mismatches first, then routing and policy. Know that selectors must mirror each other.</p></div>

<div class="scn"><h4>The new subnet that never got encrypted</h4><p>A branch added a printer VLAN, 10.20.50.0/24. Users could not reach HQ from it, though every other VLAN worked. The peer used strict selectors for 10.20.0.0/24 only, so the new subnet was outside the SA. Adding a selector for 10.20.50.0/24 on both ends fixed the problem, and the team added "update selectors" to the new-VLAN checklist.</p><p><b>Lesson:</b> with specific selectors, every new subnet is a VPN change.</p></div>

<div class="iv"><p class="q">"The tunnel shows phase 1 up but pings across it fail. What do you check?"</p><p>I look at phase 2: whether an IPsec SA exists, whether the selectors mirror each other, and whether the proposal and PFS agree. If an SA exists, I move to the route into the tunnel interface and the firewall policy in both directions, then check the return path on the remote side.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 2 negotiates data protection and selectors.</li>
<li>Selectors must mirror each other; wide 0.0.0.0/0 selectors avoid most mismatches between FortiGates.</li>
<li>Use PFS with DH 14 or higher and strong proposals.</li>
<li>Phase 1 up with no phase 2 points to selector or proposal mismatch.</li>
<li>New subnets need selector updates when selectors are specific.</li>
</ul></div>
`,hi:`
<p>Phase 1 ne trusted channel bana diya, ab phase 2 tay karta hai ki <b>kaun sa traffic</b> protect hoga aur <b>kaise</b>. Phase 2 mein selectors rehte hain, aur selector mismatch un tunnels ka sabse common karan hai jo phase 1 par "up" hain lekin traffic pass nahi karte. IKEv2 mein phase 2 ek <b>child SA</b> hai; FortiOS phir bhi configuration object ko <code>phase2-interface</code> kehta hai.</p>

<h3>Phase 2 kya negotiate karta hai</h3>
<ul>
<li><b>Proposal:</b> woh algorithms jo data protect karte hain, jaise <code>aes256gcm</code> ya <code>aes256-sha256</code>. Wahi salah: AES-256 ya AES-GCM, SHA-2, DES, 3DES, MD5 ya SHA-1 nahi.</li>
<li><b>PFS (Perfect Forward Secrecy):</b> har rekey ke liye extra Diffie-Hellman exchange, taaki ek key chori hone se purana ya naya traffic expose na ho. Enable karo aur DH group 14 ya upar (jaise 20) chuno. Dono sides PFS aur group par agree hone chahiye.</li>
<li><b>Lifetime:</b> seconds mein, default 43200 (12 ghante). Chhoti wali side pehle rekey karti hai.</li>
<li><b>Selectors:</b> source aur destination subnets jinhe yeh child SA protect karega.</li>
</ul>

<h3>Selectors: phase 2 ka dil</h3>
<p><b>Selector</b> (proxy ID ya traffic selector bhi kehte hain) ek pair hai: local subnet aur remote subnet. Traffic IPsec SA mein tabhi jaata hai jab woh match kare. Dono sides ke selectors <b>mirror-image</b> hone chahiye: jo HQ ke liye "source" hai woh branch ke liye "destination" hai. HQ kahe 10.10.0.0/24 se 10.20.0.0/24, to branch ko kehna chahiye 10.20.0.0/24 se 10.10.0.0/24, ya dono wide setting <code>0.0.0.0/0</code> se <code>0.0.0.0/0</code> use kar sakte hain.</p>
<ul>
<li><b>Wide selectors (0.0.0.0/0).</b> FortiGate ka default. Route-based VPNs mein routing table aur firewall policy tay karti hain ki asal mein kya tunnel mein jaata hai, isliye wide selectors simple aur robust hain. Dono peers FortiGate hon to bhi yahi sahi choice hai.</li>
<li><b>Specific selectors.</b> Tab zaroori jab peer doosre vendor ka ho jo strict proxy IDs use karta hai, ya kuch policy-driven designs mein. Inhe exactly mirror karna hota hai. Kai subnets ke liye version aur peer support ke hisaab se kai phase 2 entries (har ek ka apna SA) ya address group chahiye.</li>
</ul>
<p>IKEv1 mein selector mismatch aam taur par log mein failed phase 2 ki tarah dikhta hai. IKEv2 mein responder proposed traffic selectors ko jahan ho sake narrow karta hai; kuch acceptable na bache to exchange traffic-selector error ke saath fail hota hai. Dono mein symptom wahi hai: phase 1 up, phase 2 nahi.</p>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># FGT-HQ: wide selectors ke saath phase 2 (reference)</span>
config vpn ipsec phase2-interface
    edit "to-BRANCH-p2"
        set phase1name "to-BRANCH"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set keylifeseconds 43200
        set auto-negotiate enable
    next
end

<span class="c"># Alternative: specific selectors, branch par mirror</span>
config vpn ipsec phase2-interface
    edit "to-BRANCH-p2"
        set phase1name "to-BRANCH"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
        set src-subnet 10.10.0.0 255.255.255.0
        set dst-subnet 10.20.0.0 255.255.255.0
    next
end</pre>
<p>Branch par dono subnets ulte hote hain: <code>src-subnet 10.20.0.0</code> aur <code>dst-subnet 10.10.0.0</code>. <code>auto-negotiate enable</code> se FortiGate traffic ka intezaar kiye bina khud SA up kar leta hai, aur <code>keepalive</code> idle tunnel par SA zinda rakhne mein madad karta hai. Selectors address objects bhi ho sakte hain (<code>src-addr-type name</code> aur <code>src-name</code>), jisse configuration readable rehti hai.</p>

<div class="dia"><svg viewBox="0 0 640 180" role="img" aria-label="Mirror selectors">
<rect x="30" y="40" width="250" height="100" rx="10" fill="#bae6fd"/><text x="155" y="68" text-anchor="middle" class="svg-ink" font-size="13">HQ selector</text><text x="155" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.10.0.0/24</text><text x="155" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.20.0.0/24</text>
<rect x="360" y="40" width="250" height="100" rx="10" fill="#bae6fd"/><text x="485" y="68" text-anchor="middle" class="svg-ink" font-size="13">Branch selector</text><text x="485" y="92" text-anchor="middle" class="svg-muted" font-size="12">src 10.20.0.0/24</text><text x="485" y="112" text-anchor="middle" class="svg-muted" font-size="12">dst 10.10.0.0/24</text>
<line x1="280" y1="80" x2="360" y2="100" stroke="#64748b" stroke-width="2"/><line x1="280" y1="100" x2="360" y2="80" stroke="#64748b" stroke-width="2"/>
<text x="320" y="160" text-anchor="middle" class="svg-accent" font-size="12">Doosri side par source aur destination swap hote hain</text>
</svg><p class="cap">Selectors ek-doosre ke mirror image hone chahiye.</p></div>

<h3>Phase 1 up, phase 2 down: kaise sochein</h3>
<ol>
<li>Kya phase 2 proposal common hai, PFS aur DH group sameet?</li>
<li>Kya selectors ek-doosre ko mirror karte hain, ya dono wide hain?</li>
<li>Kya <code>phase1name</code> mein phase 1 ka naam sahi hai?</li>
<li>Kya doosri side alag IKE version use karti hai? (Tab phase 1 bhi up nahi hota.)</li>
<li>SA hai lekin traffic nahi? Tab problem routing ya policy ki hai, jo agle chapter mein hai.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> HQ wide selectors use karta hai. Branch, jo doosre vendor ka hai, 10.20.0.0/24 se 10.10.0.0/24 par adda hai. Strict peer 0.0.0.0/0 ka proposal reject karta hai. Fix hai FortiGate par specific mirror selectors set karna: HQ src 10.10.0.0/24 aur dst 10.20.0.0/24. Tab tunnel negotiate ho jaata hai. Branch baad mein 10.30.0.0/24 add kare to dono ends par doosra selector add karna padega, warna 10.30.0.0/24 ka traffic tunnel se nahi jaayega.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Dono sides par same subnets same order mein daalna, ulta karne ki bajaye. Bhool jaana ki strict peer par naya LAN add karne ke liye selector change chahiye. PFS sirf ek side par enabled. Compatibility ke liye phase 2 proposals mein purane algorithms chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Phase 1 established hai lekin tunnel traffic pass nahi karta, to exam chahta hai ki aap pehle phase 2 selector ya proposal mismatch socho, phir routing aur policy. Yaad rakho ki selectors ek-doosre ko mirror karte hain.</p></div>

<div class="scn"><h4>Naya subnet jo kabhi encrypt nahi hua</h4><p>Ek branch ne printer VLAN, 10.20.50.0/24, add kiya. Us se users HQ tak nahi pahunch paaye, jabki baaki saare VLANs chal rahe the. Peer sirf 10.20.0.0/24 ke liye strict selectors use karta tha, isliye naya subnet SA ke bahar tha. Dono ends par 10.20.50.0/24 ka selector add karne se problem theek hui, aur team ne new-VLAN checklist mein "selectors update karo" jod diya.</p><p><b>Lesson:</b> specific selectors ke saath har naya subnet VPN change hai.</p></div>

<div class="iv"><p class="q">"Tunnel mein phase 1 up hai lekin uske across ping fail hote hain. Kya check karoge?"</p><p>Main phase 2 dekhta hoon: IPsec SA hai ya nahi, selectors ek-doosre ko mirror karte hain ya nahi, aur proposal aur PFS agree hain ya nahi. SA ho to main tunnel interface ke route aur dono directions ki firewall policy par jaata hoon, phir remote side par return path check karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Phase 2 data protection aur selectors negotiate karta hai.</li>
<li>Selectors mirror hone chahiye; wide 0.0.0.0/0 selectors FortiGates ke beech zyadatar mismatches rokte hain.</li>
<li>DH 14 ya upar aur strong proposals ke saath PFS use karo.</li>
<li>Phase 1 up aur phase 2 nahi, to selector ya proposal mismatch.</li>
<li>Specific selectors hon to naye subnets ke liye selector update chahiye.</li>
</ul></div>
`}};export{e as default};