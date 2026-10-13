var e={id:`ipsec-dialup`,h:{en:`Moving to IPsec dial-up`,hi:`IPsec dial-up par move karna`},body:{en:`
<p>Newer FortiOS releases are moving remote access away from SSL VPN towards <b>IPsec dial-up</b> VPN. This chapter explains why, how the concepts map from SSL VPN to IPsec, and what a dial-up configuration looks like. You already know most of the ideas from <b>nse4-ipsec</b>; the difference is that the remote end is a roaming client without a fixed address. Reference configuration is <b>not run in the simulator</b>, and you should always confirm syntax and feature availability against the documentation for your exact build.</p>

<h3>Why the move?</h3>
<ul>
<li><b>Security record.</b> SSL VPN services have faced a steady stream of vulnerabilities. IPsec has a smaller, well-reviewed attack surface and strong modern cryptography.</li>
<li><b>Performance.</b> IPsec with hardware offload and ESP is generally faster than TLS-based tunnels.</li>
<li><b>Simplicity of product.</b> One VPN technology for both site-to-site and remote access means one skill set and fewer features to patch.</li>
<li><b>Vendor direction.</b> As noted in chapter 1, tunnel-mode SSL VPN has been removed from some models and later 7.6 builds. Check the release notes of your firmware.</li>
</ul>

<h3>Mapping the concepts</h3>
<table class="cmp"><tr><th>SSL VPN idea</th><th>IPsec dial-up equivalent</th></tr>
<tr><td>Server certificate on the gateway</td><td>Certificate in phase 1 (<code>authmethod signature</code>) or a strong PSK</td></tr>
<tr><td>Users and groups</td><td>Same users and groups, checked with EAP or XAuth (<code>authusrgrp</code>)</td></tr>
<tr><td>Tunnel pool on ssl.root</td><td>Mode config address range in phase 1 (<code>mode-cfg</code>)</td></tr>
<tr><td>Portal with split tunnelling</td><td>Split-include networks pushed to the client</td></tr>
<tr><td>DNS in SSL VPN settings</td><td>DNS servers pushed through mode config</td></tr>
<tr><td>Policy from ssl.root</td><td>Policy from the dial-up tunnel interface</td></tr>
<tr><td>Web mode bookmarks</td><td>No direct equivalent; use agentless or ZTNA access instead</td></tr>
<tr><td>FortiClient SSL connection</td><td>FortiClient IPsec connection</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="IPsec dial-up flow">
<rect x="20" y="60" width="130" height="70" rx="10" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="12">FortiClient</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="11">any address</text>
<rect x="260" y="40" width="130" height="110" rx="10" fill="#bbf7d0"/><text x="325" y="65" text-anchor="middle" class="svg-ink" font-size="12">FortiGate</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="11">type dynamic</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="11">mode config pool</text><text x="325" y="124" text-anchor="middle" class="svg-muted" font-size="11">EAP and groups</text>
<rect x="500" y="60" width="120" height="70" rx="10" fill="#fde68a"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="12">Company LAN</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.0/24</text>
<line x1="150" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="205" y="85" text-anchor="middle" class="svg-accent" font-size="11">IKEv2, ESP</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Roaming client gets an address from the gateway, like the SSL VPN pool</text>
</svg><p class="cap">The gateway accepts any client address and assigns a tunnel address.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>A dial-up phase 1 with IKEv2, certificate authentication on the gateway and EAP for the user. The address object <code>HQ-LAN</code> and the user group <code>SSLVPN-Users</code> are reused from the earlier chapters.</p>
<pre class="code"><span class="c"># Dial-up phase 1: the remote gateway address is dynamic</span>
config vpn ipsec phase1-interface
    edit "dialup-staff"
        set type dynamic
        set interface "port1"
        set ike-version 2
        set authmethod signature
        set certificate "vpn-company-example-cert"
        set peertype any
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set eap enable
        set eap-identity send-request
        set authusrgrp "SSLVPN-Users"
        set mode-cfg enable
        set ipv4-start-ip 10.99.0.10
        set ipv4-end-ip 10.99.0.50
        set ipv4-netmask 255.255.255.255
        set ipv4-dns-server1 10.10.0.10
        set ipv4-split-include "HQ-LAN"
        set dpd on-idle
    next
end

<span class="c"># Phase 2 for the dial-up tunnel</span>
config vpn ipsec phase2-interface
    edit "dialup-staff-p2"
        set phase1name "dialup-staff"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
    next
end

<span class="c"># Policy from the dial-up tunnel to the LAN, group-based</span>
config firewall policy
    edit 31
        set name "DIALUP-to-fileserver"
        set srcintf "dialup-staff"
        set dstintf "port2"
        set srcaddr "all"
        set dstaddr "FILE-SERVER"
        set groups "SSLVPN-Users"
        set action accept
        set schedule "always"
        set service "SMB" "RDP"
        set logtraffic all
    next
end</pre>
<p>In place of EAP, an IKEv1 design would use <code>xauthtype</code> with a pre-shared key or certificate. IKEv2 with EAP and certificates is the modern choice. For stronger identity, you can require a client certificate as well. MFA is delivered by the user source behind <code>authusrgrp</code>: a RADIUS server that prompts for a token, or local users with FortiToken. A route back to the dial-up pool is created automatically when clients connect (the <code>add-route</code> behaviour), but internal servers still need a return path to the pool through the FortiGate.</p>

<h3>The migration plan</h3>
<ol>
<li><b>Inventory.</b> List who uses SSL VPN, which portals and which applications, and which devices cannot run FortiClient.</li>
<li><b>Build in parallel.</b> Create the dial-up tunnel, address pool, groups and policies alongside SSL VPN, with a different pool.</li>
<li><b>Pilot.</b> Move a small group, collect issues (profiles, DNS, split tunnelling, MFA).</li>
<li><b>Migrate in waves.</b> Push new FortiClient profiles, communicate with users, move groups in stages.</li>
<li><b>Replace web mode.</b> Decide how contractors and unmanaged devices will reach single applications (agentless or ZTNA access) before turning SSL VPN off.</li>
<li><b>Retire SSL VPN.</b> Disable the service, remove the portal and policies, and update documentation and monitoring.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> A 300-user company runs SSL VPN with tunnel mode. They create <code>dialup-staff</code>, using a new pool 10.99.0.10 to 10.99.0.50, mirror the policies, and move the IT team first. The pilot finds that internal DNS names do not resolve because the DNS server was missing from the dial-up phase 1. After adding it and migrating in four waves over a month, the SSL VPN settings are removed.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Reusing the SSL VPN pool for the dial-up tunnel during overlap. Forgetting split-include, so the client sends all traffic or none. Not testing MFA with the new authentication path. Leaving the SSL VPN service running after migration.</p></div>
<div class="exam"><p><b>Exam trap.</b> For a roaming client, the phase 1 type is <code>dynamic</code> because the remote gateway address is not known in advance. The address pool is set with mode config, and policies use the dial-up tunnel interface as source.</p></div>

<div class="scn"><h4>Retiring SSL VPN before the deadline</h4><p>After a security advisory the company decided to leave SSL VPN. They built the dial-up tunnel with certificates and EAP, pushed FortiClient profiles through their management tool, and migrated team by team. Contractors moved to a ZTNA-style access for one application. Six weeks later the old service was disabled and removed from the internet-facing interface.</p><p><b>Lesson:</b> a planned parallel migration beats an emergency cutover.</p></div>

<div class="iv"><p class="q">"How does IPsec dial-up replace SSL VPN tunnel mode?"</p><p>A dynamic phase 1 accepts clients from any address. IKEv2 with a certificate on the gateway and EAP for users reuses the same user groups and MFA. Mode config assigns the tunnel address, DNS and split-include networks like the SSL VPN pool and portal did, and policies use the dial-up tunnel interface as source. FortiClient is the client.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Newer FortiOS removes SSL VPN tunnel mode and favours IPsec dial-up.</li>
<li>Dial-up phase 1 uses type dynamic, mode config, EAP and user groups.</li>
<li>Pools, DNS and split tunnelling move from SSL VPN settings into phase 1.</li>
<li>Policies use the dial-up tunnel interface as the source interface.</li>
<li>Plan a parallel migration and decide the web-mode replacement first.</li>
</ul></div>
`,hi:`
<p>Naye FortiOS releases remote access ko SSL VPN se door <b>IPsec dial-up</b> VPN ki taraf le ja rahe hain. Yeh chapter samjhata hai ki aisa kyun, concepts SSL VPN se IPsec mein kaise map hote hain, aur dial-up configuration kaisi dikhti hai. Zyadatar ideas aap <b>nse4-ipsec</b> se jaante ho; difference yeh hai ki remote end roaming client hai jiska fixed address nahi hota. Reference configuration <b>simulator mein nahi chalaye gaye</b>, aur apne exact build ke documentation se syntax aur feature availability hamesha confirm karo.</p>

<h3>Yeh move kyun?</h3>
<ul>
<li><b>Security record.</b> SSL VPN services ko vulnerabilities ki lagaatar dhaara jhelni padi. IPsec ki attack surface chhoti, achhi tarah reviewed aur modern cryptography strong hai.</li>
<li><b>Performance.</b> Hardware offload ke saath IPsec aur ESP aam taur par TLS-based tunnels se tez hai.</li>
<li><b>Product ki simplicity.</b> Site-to-site aur remote access dono ke liye ek VPN technology matlab ek skill set aur patch karne ke liye kam features.</li>
<li><b>Vendor direction.</b> Chapter 1 mein bataya, tunnel-mode SSL VPN kuch models aur baad ke 7.6 builds se hata diya gaya hai. Apne firmware ke release notes check karo.</li>
</ul>

<h3>Concepts ki mapping</h3>
<table class="cmp"><tr><th>SSL VPN idea</th><th>IPsec dial-up equivalent</th></tr>
<tr><td>Gateway par server certificate</td><td>Phase 1 mein certificate (<code>authmethod signature</code>) ya strong PSK</td></tr>
<tr><td>Users aur groups</td><td>Wahi users aur groups, EAP ya XAuth se check (<code>authusrgrp</code>)</td></tr>
<tr><td>ssl.root par tunnel pool</td><td>Phase 1 mein mode config address range (<code>mode-cfg</code>)</td></tr>
<tr><td>Split tunnelling wala portal</td><td>Client ko push hue split-include networks</td></tr>
<tr><td>SSL VPN settings mein DNS</td><td>Mode config se push hue DNS servers</td></tr>
<tr><td>ssl.root se policy</td><td>Dial-up tunnel interface se policy</td></tr>
<tr><td>Web mode bookmarks</td><td>Seedha equivalent nahi; uski jagah agentless ya ZTNA access</td></tr>
<tr><td>FortiClient SSL connection</td><td>FortiClient IPsec connection</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="IPsec dial-up flow">
<rect x="20" y="60" width="130" height="70" rx="10" fill="#bae6fd"/><text x="85" y="90" text-anchor="middle" class="svg-ink" font-size="12">FortiClient</text><text x="85" y="110" text-anchor="middle" class="svg-muted" font-size="11">koi bhi address</text>
<rect x="260" y="40" width="130" height="110" rx="10" fill="#bbf7d0"/><text x="325" y="65" text-anchor="middle" class="svg-ink" font-size="12">FortiGate</text><text x="325" y="88" text-anchor="middle" class="svg-muted" font-size="11">type dynamic</text><text x="325" y="106" text-anchor="middle" class="svg-muted" font-size="11">mode config pool</text><text x="325" y="124" text-anchor="middle" class="svg-muted" font-size="11">EAP aur groups</text>
<rect x="500" y="60" width="120" height="70" rx="10" fill="#fde68a"/><text x="560" y="90" text-anchor="middle" class="svg-ink" font-size="12">Company LAN</text><text x="560" y="110" text-anchor="middle" class="svg-muted" font-size="11">10.10.0.0/24</text>
<line x1="150" y1="95" x2="260" y2="95" stroke="#64748b" stroke-width="2"/><line x1="390" y1="95" x2="500" y2="95" stroke="#64748b" stroke-width="2"/>
<text x="205" y="85" text-anchor="middle" class="svg-accent" font-size="11">IKEv2, ESP</text><text x="320" y="175" text-anchor="middle" class="svg-muted" font-size="12">Roaming client ko gateway se address milta hai, SSL VPN pool ki tarah</text>
</svg><p class="cap">Gateway koi bhi client address accept karta hai aur tunnel address assign karta hai.</p></div>

<h3>Reference configuration (not run in the simulator)</h3>
<p>IKEv2 ke saath dial-up phase 1, gateway par certificate authentication aur user ke liye EAP. Address object <code>HQ-LAN</code> aur user group <code>SSLVPN-Users</code> pichle chapters se reuse hue hain.</p>
<pre class="code"><span class="c"># Dial-up phase 1: remote gateway address dynamic hai</span>
config vpn ipsec phase1-interface
    edit "dialup-staff"
        set type dynamic
        set interface "port1"
        set ike-version 2
        set authmethod signature
        set certificate "vpn-company-example-cert"
        set peertype any
        set proposal aes256gcm-prfsha384
        set dhgrp 20
        set eap enable
        set eap-identity send-request
        set authusrgrp "SSLVPN-Users"
        set mode-cfg enable
        set ipv4-start-ip 10.99.0.10
        set ipv4-end-ip 10.99.0.50
        set ipv4-netmask 255.255.255.255
        set ipv4-dns-server1 10.10.0.10
        set ipv4-split-include "HQ-LAN"
        set dpd on-idle
    next
end

<span class="c"># Dial-up tunnel ke liye phase 2</span>
config vpn ipsec phase2-interface
    edit "dialup-staff-p2"
        set phase1name "dialup-staff"
        set proposal aes256gcm
        set pfs enable
        set dhgrp 20
    next
end

<span class="c"># Dial-up tunnel se LAN tak policy, group-based</span>
config firewall policy
    edit 31
        set name "DIALUP-to-fileserver"
        set srcintf "dialup-staff"
        set dstintf "port2"
        set srcaddr "all"
        set dstaddr "FILE-SERVER"
        set groups "SSLVPN-Users"
        set action accept
        set schedule "always"
        set service "SMB" "RDP"
        set logtraffic all
    next
end</pre>
<p>EAP ki jagah IKEv1 design pre-shared key ya certificate ke saath <code>xauthtype</code> use karta. Certificates ke saath IKEv2 aur EAP modern choice hai. Stronger identity ke liye client certificate bhi maang sakte ho. MFA <code>authusrgrp</code> ke peeche wale user source se aata hai: RADIUS server jo token maangta hai, ya FortiToken ke saath local users. Dial-up pool ka route clients connect hone par automatically banta hai (<code>add-route</code> behaviour), lekin internal servers ko phir bhi FortiGate ke through pool tak return path chahiye.</p>

<h3>Migration plan</h3>
<ol>
<li><b>Inventory.</b> List karo ki SSL VPN kaun use karta hai, kaun se portals aur applications, aur kaun se devices FortiClient nahi chala sakte.</li>
<li><b>Parallel mein build karo.</b> SSL VPN ke saath dial-up tunnel, address pool, groups aur policies alag pool ke saath banao.</li>
<li><b>Pilot.</b> Ek chhota group move karo, issues collect karo (profiles, DNS, split tunnelling, MFA).</li>
<li><b>Waves mein migrate karo.</b> Naye FortiClient profiles push karo, users se communicate karo, groups ko stages mein move karo.</li>
<li><b>Web mode ka replacement.</b> SSL VPN band karne se pehle tay karo ki contractors aur unmanaged devices ek application tak kaise pahunchenge (agentless ya ZTNA access).</li>
<li><b>SSL VPN retire karo.</b> Service disable karo, portal aur policies hatao, aur documentation aur monitoring update karo.</li>
</ol>

<div class="eg"><p><b>Worked example.</b> 300-user company tunnel mode ke saath SSL VPN chalati hai. Woh naye pool 10.99.0.10 se 10.99.0.50 ke saath <code>dialup-staff</code> banate hain, policies mirror karte hain, aur pehle IT team ko move karte hain. Pilot mein pata chalta hai ki internal DNS names resolve nahi hote kyunki dial-up phase 1 mein DNS server missing tha. Use add karke aur ek mahine mein chaar waves mein migrate karke SSL VPN settings hata di jaati hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Overlap ke dauran dial-up tunnel ke liye SSL VPN pool reuse karna. Split-include bhool jaana, jisse client saara traffic ya kuch bhi nahi bhejta. Naye authentication path ke saath MFA test na karna. Migration ke baad SSL VPN service chalta chhod dena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Roaming client ke liye phase 1 type <code>dynamic</code> hota hai kyunki remote gateway address pehle se pata nahi hota. Address pool mode config se set hota hai, aur policies source ki tarah dial-up tunnel interface use karti hain.</p></div>

<div class="scn"><h4>Deadline se pehle SSL VPN retire karna</h4><p>Security advisory ke baad company ne SSL VPN chhodne ka faisla kiya. Unhone certificates aur EAP ke saath dial-up tunnel banaya, management tool se FortiClient profiles push kiye, aur team-by-team migrate kiya. Contractors ek application ke liye ZTNA-style access par gaye. Chhe hafte baad purani service disable hui aur internet-facing interface se hata di gayi.</p><p><b>Lesson:</b> planned parallel migration emergency cutover se behtar hai.</p></div>

<div class="iv"><p class="q">"IPsec dial-up SSL VPN tunnel mode ko kaise replace karta hai?"</p><p>Dynamic phase 1 kisi bhi address se clients accept karta hai. Gateway par certificate aur users ke liye EAP ke saath IKEv2 wahi user groups aur MFA reuse karta hai. Mode config tunnel address, DNS aur split-include networks assign karta hai jaise SSL VPN pool aur portal karte the, aur policies source ki tarah dial-up tunnel interface use karti hain. FortiClient client hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Naya FortiOS SSL VPN tunnel mode hata raha hai aur IPsec dial-up prefer karta hai.</li>
<li>Dial-up phase 1 type dynamic, mode config, EAP aur user groups use karta hai.</li>
<li>Pools, DNS aur split tunnelling SSL VPN settings se phase 1 mein chale jaate hain.</li>
<li>Policies source interface ki tarah dial-up tunnel interface use karti hain.</li>
<li>Parallel migration plan karo aur pehle web-mode ka replacement tay karo.</li>
</ul></div>
`}};export{e as default};