var e={id:`ipsec-tunnel`,h:{en:`IPsec crypto profile, tunnel interface and the tunnel object`,hi:`IPsec crypto profile, tunnel interface aur tunnel object`},body:{en:`
<p>Phase 1 gave the two firewalls a secure control channel. Now we define how user traffic itself is protected and where it enters the tunnel. Three objects do that: the <b>IPsec crypto profile</b>, the <b>tunnel interface</b> and the <b>IPsec tunnel</b>.</p>

<h3>IPsec crypto profile (phase 2)</h3>
<p>This profile says how the data is wrapped. Fields:</p>
<dl class="terms">
<dt>IPsec protocol</dt><dd>ESP (encrypts and authenticates) is the norm. AH only authenticates and is rarely used.</dd>
<dt>Encryption</dt><dd>AES-256-GCM or AES-128-GCM is recommended: one algorithm gives both encryption and integrity. AES-CBC is also supported and needs a separate hash.</dd>
<dt>Authentication</dt><dd>With GCM there is no separate hash (set to none). With CBC use SHA-256 or stronger.</dd>
<dt>DH group (PFS)</dt><dd>Perfect forward secrecy: a fresh Diffie-Hellman exchange for each rekey, so a stolen key cannot unlock past traffic. Use group 14 or stronger or an elliptic-curve group. If you set "no-pfs", the exchange is skipped and your security is weaker.</dd>
<dt>Lifetime</dt><dd>How long the IPsec SA lasts before rekey. The default is 1 hour. You can also add a data-volume lifetime.</dd>
</dl>
<p>Both firewalls must offer at least one matching set of choices. If they do not, phase 2 fails with a proposal mismatch while phase 1 stays up. That pattern (phase 1 up, phase 2 down) is a classic troubleshooting clue.</p>

<h3>Tunnel interface</h3>
<p>A <b>tunnel interface</b> (named like <code>tunnel.11</code>) is a virtual Layer 3 interface. It is where the route-based design happens:</p>
<ul>
<li>Put it in a <b>virtual router</b>, so routes can point at it.</li>
<li>Put it in a <b>security zone</b> (for example VPN), so security policy can match traffic entering and leaving the tunnel.</li>
<li>An <b>IP address</b> is optional for a simple static-route design but is needed for dynamic routing across the tunnel (OSPF or BGP) and useful for tunnel monitoring. Use a small private or link-local style /30 such as 10.255.11.1/30 and 10.255.11.2/30.</li>
</ul>
<p>Use one tunnel interface per tunnel. Do not share one tunnel interface between different peers.</p>

<h3>IPsec tunnel object</h3>
<p>This object ties everything together: the <b>tunnel interface</b>, the <b>IKE gateway</b> (for auto-key mode) and the <b>IPsec crypto profile</b>. It also holds:</p>
<ul>
<li><b>Proxy IDs</b> (optional, for policy-based peers; chapter 6).</li>
<li><b>Tunnel monitor</b>: a destination IP (usually the far tunnel address) that the firewall pings through the tunnel, with an action on failure: <b>wait-recover</b> (keep the tunnel and wait) or <b>fail-over</b> (take the tunnel's routes out so another path takes over). Defaults are an interval of 3 seconds and a threshold of 5.</li>
<li><b>Anti-replay</b>: protects against replayed packets and is on by default.</li>
<li><b>Copy ToS</b>, <b>IPv6</b> and similar options, which most designs leave at their defaults.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="How objects connect">
<rect x="20" y="20" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">IKE crypto profile</text>
<rect x="20" y="85" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="113" text-anchor="middle" class="svg-ink" font-size="13">IKE gateway</text>
<rect x="20" y="150" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="178" text-anchor="middle" class="svg-ink" font-size="13">IPsec crypto profile</text>
<rect x="260" y="85" width="150" height="60" rx="10" fill="#fde68a"/><text x="335" y="120" text-anchor="middle" class="svg-ink" font-size="14">IPsec tunnel</text>
<rect x="470" y="85" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="108" text-anchor="middle" class="svg-ink" font-size="13">tunnel.11</text><text x="545" y="128" text-anchor="middle" class="svg-muted" font-size="12">zone VPN + vr default</text>
<line x1="105" y1="64" x2="105" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="107" x2="260" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="172" x2="300" y2="145" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The tunnel object is the glue between negotiation objects and the interface.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># IPsec crypto profile: AES-GCM with PFS (HQ-FW; BR-FW identical)</span>
set network ike crypto-profiles ipsec-crypto-profiles NK-IPSEC esp encryption aes-256-gcm authentication none
set network ike crypto-profiles ipsec-crypto-profiles NK-IPSEC dh-group group14 lifetime hours 1
<span class="c"># Tunnel interface in the VPN zone and the default virtual router</span>
set network interface tunnel units tunnel.11 ip 10.255.11.1/30
set zone VPN network layer3 tunnel.11
set network virtual-router default interface tunnel.11
<span class="c"># IPsec tunnel object ties it together</span>
set network tunnel ipsec NK-TUN1 auto-key ike-gateway NK-GW1
set network tunnel ipsec NK-TUN1 auto-key ipsec-crypto-profile NK-IPSEC
set network tunnel ipsec NK-TUN1 tunnel-interface tunnel.11</pre>
<p>As before, check exact syntax with <code>?</code> on your release.</p>

<div class="eg"><p><b>Worked example.</b> The branch uses AES-128-CBC with SHA-1 in its IPsec profile, while HQ offers only AES-256-GCM. Phase 1 completes, so the IKE SA appears, but phase 2 fails because no common proposal exists. Setting both sides to AES-256-GCM brings the tunnel up without touching phase 1.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Putting the tunnel interface in the same zone as the Internet-facing interface or leaving it without a zone. Use a dedicated VPN zone so you can write clear, narrow policy for remote-site traffic.</p></div>
<div class="exam"><p><b>Exam trap.</b> The IPsec tunnel references the IKE gateway, the IPsec crypto profile and the tunnel interface. If phase 1 is up and phase 2 is down, suspect the IPsec crypto profile or proxy IDs, not the IKE profile.</p></div>

<div class="scn"><h4>Phase 1 up, phase 2 down</h4><p>A new tunnel to a partner showed an IKE SA but never an IPsec SA. The partner's side was configured for AES-CBC with SHA-1 and no PFS, while HQ insisted on GCM with group 14. After agreeing a common modern set (AES-256-GCM with group 14) the IPsec SA appeared immediately.</p><p><b>Lesson:</b> phase 1 and phase 2 have separate proposals; check both.</p></div>

<div class="iv"><p class="q">"Why use PFS and what does it protect?"</p><p>Perfect forward secrecy runs a new Diffie-Hellman exchange for each phase 2 rekey, so a compromised long-term key or a single session key cannot decrypt earlier or later traffic. On PAN-OS you enable it by selecting a DH group (14 or stronger, or an elliptic-curve group) in the IPsec crypto profile.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec crypto profile: ESP with AES-GCM, PFS group 14+, 1-hour default lifetime.</li>
<li>Tunnel interface belongs in a zone and a virtual router.</li>
<li>The IPsec tunnel object binds gateway, crypto profile and tunnel interface.</li>
<li>Tunnel monitor can wait-recover or fail-over.</li>
<li>Phase 1 up with phase 2 down points to proposals or proxy IDs.</li>
</ul></div>
`,hi:`
<p>Phase 1 ne dono firewalls ko secure control channel de diya. Ab hum define karte hain ki user traffic khud kaise protect hoga aur tunnel mein kahan se enter karega. Yeh kaam teen objects karte hain: <b>IPsec crypto profile</b>, <b>tunnel interface</b> aur <b>IPsec tunnel</b>.</p>

<h3>IPsec crypto profile (phase 2)</h3>
<p>Yeh profile batata hai ki data kaise wrap hoga. Fields:</p>
<dl class="terms">
<dt>IPsec protocol</dt><dd>ESP (encrypt aur authenticate karta hai) norm hai. AH sirf authenticate karta hai aur kam use hota hai.</dd>
<dt>Encryption</dt><dd>AES-256-GCM ya AES-128-GCM recommended hai: ek hi algorithm encryption aur integrity dono deta hai. AES-CBC bhi supported hai aur use alag hash chahiye.</dd>
<dt>Authentication</dt><dd>GCM ke saath alag hash nahi hota (none set karo). CBC ke saath SHA-256 ya majboot use karo.</dd>
<dt>DH group (PFS)</dt><dd>Perfect forward secrecy: har rekey ke liye naya Diffie-Hellman exchange, taaki chori hui key purane traffic ko unlock na kar sake. Group 14 ya majboot ya elliptic-curve group use karo. "no-pfs" set karoge to exchange skip ho jaata hai aur security kamzor hoti hai.</dd>
<dt>Lifetime</dt><dd>IPsec SA rekey se pehle kitna chalta hai. Default 1 hour hai. Aap data-volume lifetime bhi jod sakte ho.</dd>
</dl>
<p>Dono firewalls ko kam se kam ek matching set of choices offer karna chahiye. Nahi to phase 2 proposal mismatch ke saath fail hota hai jabki phase 1 up rehta hai. Yeh pattern (phase 1 up, phase 2 down) classic troubleshooting clue hai.</p>

<h3>Tunnel interface</h3>
<p><b>Tunnel interface</b> (jiska naam <code>tunnel.11</code> jaisa hota hai) ek virtual Layer 3 interface hai. Route-based design yahin hota hai:</p>
<ul>
<li>Use ek <b>virtual router</b> mein rakho, taaki routes uski taraf point kar sakein.</li>
<li>Use ek <b>security zone</b> (jaise VPN) mein rakho, taaki security policy tunnel mein aane-jaane wale traffic ko match kar sake.</li>
<li>Simple static-route design ke liye <b>IP address</b> optional hai, lekin tunnel ke upar dynamic routing (OSPF ya BGP) ke liye zaroori hai aur tunnel monitoring ke liye useful. 10.255.11.1/30 aur 10.255.11.2/30 jaisa chhota private /30 use karo.</li>
</ul>
<p>Har tunnel ke liye ek tunnel interface use karo. Alag peers ke beech ek tunnel interface share mat karo.</p>

<h3>IPsec tunnel object</h3>
<p>Yeh object sab kuch jodta hai: <b>tunnel interface</b>, <b>IKE gateway</b> (auto-key mode ke liye) aur <b>IPsec crypto profile</b>. Isme yeh bhi hota hai:</p>
<ul>
<li><b>Proxy IDs</b> (optional, policy-based peers ke liye; chapter 6).</li>
<li><b>Tunnel monitor</b>: ek destination IP (aam taur par door ka tunnel address) jise firewall tunnel ke through ping karta hai, failure par action ke saath: <b>wait-recover</b> (tunnel rakho aur intezaar karo) ya <b>fail-over</b> (tunnel ke routes hata do taaki doosra path le le). Defaults 3 second interval aur threshold 5 hain.</li>
<li><b>Anti-replay</b>: replayed packets se bachata hai aur default mein on hai.</li>
<li><b>Copy ToS</b>, <b>IPv6</b> jaise options, jinhe zyadatar designs default par chhod dete hain.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="How objects connect">
<rect x="20" y="20" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="48" text-anchor="middle" class="svg-ink" font-size="13">IKE crypto profile</text>
<rect x="20" y="85" width="170" height="44" rx="8" fill="#bae6fd"/><text x="105" y="113" text-anchor="middle" class="svg-ink" font-size="13">IKE gateway</text>
<rect x="20" y="150" width="170" height="44" rx="8" fill="#ddd6fe"/><text x="105" y="178" text-anchor="middle" class="svg-ink" font-size="13">IPsec crypto profile</text>
<rect x="260" y="85" width="150" height="60" rx="10" fill="#fde68a"/><text x="335" y="120" text-anchor="middle" class="svg-ink" font-size="14">IPsec tunnel</text>
<rect x="470" y="85" width="150" height="60" rx="10" fill="#bbf7d0"/><text x="545" y="108" text-anchor="middle" class="svg-ink" font-size="13">tunnel.11</text><text x="545" y="128" text-anchor="middle" class="svg-muted" font-size="12">zone VPN + vr default</text>
<line x1="105" y1="64" x2="105" y2="85" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="107" x2="260" y2="107" stroke="#64748b" stroke-width="2"/>
<line x1="190" y1="172" x2="300" y2="145" stroke="#64748b" stroke-width="2"/>
<line x1="410" y1="115" x2="470" y2="115" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Tunnel object negotiation objects aur interface ke beech ka glue hai.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<pre class="code"><span class="c"># IPsec crypto profile: AES-GCM aur PFS ke saath (HQ-FW; BR-FW identical)</span>
set network ike crypto-profiles ipsec-crypto-profiles NK-IPSEC esp encryption aes-256-gcm authentication none
set network ike crypto-profiles ipsec-crypto-profiles NK-IPSEC dh-group group14 lifetime hours 1
<span class="c"># VPN zone aur default virtual router mein tunnel interface</span>
set network interface tunnel units tunnel.11 ip 10.255.11.1/30
set zone VPN network layer3 tunnel.11
set network virtual-router default interface tunnel.11
<span class="c"># IPsec tunnel object sab jodta hai</span>
set network tunnel ipsec NK-TUN1 auto-key ike-gateway NK-GW1
set network tunnel ipsec NK-TUN1 auto-key ipsec-crypto-profile NK-IPSEC
set network tunnel ipsec NK-TUN1 tunnel-interface tunnel.11</pre>
<p>Pehle ki tarah, exact syntax apni release par <code>?</code> se check karo.</p>

<div class="eg"><p><b>Worked example.</b> Branch apne IPsec profile mein AES-128-CBC aur SHA-1 use karta hai, jabki HQ sirf AES-256-GCM offer karta hai. Phase 1 complete hota hai, isliye IKE SA dikhta hai, lekin phase 2 fail hota hai kyunki koi common proposal nahi. Dono sides AES-256-GCM set karne se phase 1 ko chhue bina tunnel up aa jaata hai.</p></div>

<div class="warn"><p><b>Common beginner mistake.</b> Tunnel interface ko Internet-facing interface ke same zone mein rakhna ya bina zone ke chhod dena. Dedicated VPN zone use karo taaki remote-site traffic ke liye saaf, narrow policy likh sako.</p></div>
<div class="exam"><p><b>Exam trap.</b> IPsec tunnel IKE gateway, IPsec crypto profile aur tunnel interface ko reference karta hai. Phase 1 up aur phase 2 down ho to IPsec crypto profile ya proxy IDs par shak karo, IKE profile par nahi.</p></div>

<div class="scn"><h4>Phase 1 up, phase 2 down</h4><p>Ek partner ke naye tunnel mein IKE SA dikha lekin IPsec SA kabhi nahi. Partner ki side AES-CBC aur SHA-1 bina PFS ke ke liye configured thi, jabki HQ GCM aur group 14 par ada tha. Ek common modern set (group 14 ke saath AES-256-GCM) par agree karne ke baad IPsec SA turant aa gaya.</p><p><b>Lesson:</b> phase 1 aur phase 2 ke alag proposals hote hain; dono check karo.</p></div>

<div class="iv"><p class="q">"PFS kyun use karte hain aur yeh kya protect karta hai?"</p><p>Perfect forward secrecy har phase 2 rekey ke liye naya Diffie-Hellman exchange chalata hai, isliye compromised long-term key ya ek session key purane ya naye traffic ko decrypt nahi kar sakti. PAN-OS par IPsec crypto profile mein DH group (14 ya majboot, ya elliptic-curve group) chunkar ise enable karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>IPsec crypto profile: AES-GCM ke saath ESP, PFS group 14+, 1-hour default lifetime.</li>
<li>Tunnel interface zone aur virtual router mein hona chahiye.</li>
<li>IPsec tunnel object gateway, crypto profile aur tunnel interface ko bind karta hai.</li>
<li>Tunnel monitor wait-recover ya fail-over kar sakta hai.</li>
<li>Phase 1 up aur phase 2 down proposals ya proxy IDs ki taraf ishara karta hai.</li>
</ul></div>
`}};export{e as default};