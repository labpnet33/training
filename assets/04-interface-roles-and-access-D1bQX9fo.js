var e={id:`interface-roles-and-access`,h:{en:`Interface roles and administrative access per VLAN`,hi:`Interface roles aur har VLAN par administrative access`},body:{en:`
<p>Every interface, physical or VLAN, carries a <b>role</b>. The role is a label that says what the interface is for. FortiOS has four values: <b>lan</b>, <b>wan</b>, <b>dmz</b> and <b>undefined</b>. You met it in nse4-setup; here it matters because a branch can have many VLAN interfaces and the labels keep the design readable.</p>
<h3>What a role does and does not do</h3>
<table class="cmp"><tr><th>Role</th><th>Typical use</th><th>Effect</th></tr>
<tr><td>lan</td><td>user and server networks behind the firewall</td><td>tags it as internal; the GUI offers LAN-style options such as a DHCP server</td></tr>
<tr><td>wan</td><td>links toward the ISP</td><td>tags it as external; the GUI offers WAN-style options</td></tr>
<tr><td>dmz</td><td>published servers</td><td>tags it as a server network</td></tr>
<tr><td>undefined</td><td>anything else (the default)</td><td>no assumptions; the GUI shows all options</td></tr></table>
<p>The role appears in logs and in GUI views, and it influences which options the GUI shows. <b>It never changes forwarding.</b> A packet is routed and filtered by address and policy whatever the role says.</p>
<h3>Setting the role and checking it</h3>
<p>The VLAN interfaces from chapter 2 were created with <code>set role lan</code>. The result in the real configuration, with the parent and VLAN ID:</p>
<pre class="code">NK-PUNE-FGT # show system interface VLAN20</pre>
<pre class="out">config system interface
    edit "VLAN20"
        set vdom "root"
        set ip 10.10.20.1 255.255.255.0
        set allowaccess ping
        set alias "Servers"
        set <span class="hl">role lan</span>
        set snmp-index 10
        set interface "port2"
        set vlanid 20
    next
end</pre>
<h3>Administrative access per VLAN</h3>
<p>Each VLAN interface has its own <code>allowaccess</code>. It is tempting to allow everything on every VLAN; resist that. A sensible design for this topology:</p>
<ul>
<li><b>VLAN10 Staff:</b> ping so users can test connectivity; management only if administrators work from there.</li>
<li><b>VLAN20 Servers:</b> ping for monitoring; never the admin GUI for user devices.</li>
<li><b>A guest VLAN:</b> nothing at all, not even ping, so guests cannot probe the firewall.</li>
<li><b>Management:</b> one VLAN or port reserved for administrators, with HTTPS and SSH there only.</li>
</ul>
<p>In the lab, both VLAN interfaces allow ping only, which is why the PC can ping 10.10.10.1 but cannot open an admin session on it. This is allowaccess doing its job, per interface.</p>
<p>A DHCP server is often added to a LAN-role VLAN so clients get addresses automatically. The simulator does not model DHCP servers, so this is a reference configuration (not run in the simulator):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config system dhcp server
    edit 1
        set interface "VLAN10"
        set default-gateway 10.10.10.1
        set netmask 255.255.255.0
        config ip-range
            edit 1
                set start-ip 10.10.10.100
                set end-ip 10.10.10.199
            next
        end
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="A role and an allowaccess set chosen for each interface"><rect x="10" y="15" width="190" height="55" rx="9" fill="#bbf7d0"/><text x="105" y="39.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10 Staff</text><text x="105" y="56.5" text-anchor="middle" class="svg-muted" font-size="11">role lan | allowaccess ping</text><rect x="10" y="95" width="190" height="55" rx="9" fill="#ddd6fe"/><text x="105" y="119.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20 Servers</text><text x="105" y="136.5" text-anchor="middle" class="svg-muted" font-size="11">role lan | allowaccess ping</text><rect x="240" y="15" width="190" height="55" rx="9" fill="#e2e8f0"/><text x="335" y="39.5" text-anchor="middle" class="svg-ink" font-size="13">port1 WAN</text><text x="335" y="56.5" text-anchor="middle" class="svg-muted" font-size="11">role wan | allowaccess ping</text><rect x="240" y="95" width="190" height="55" rx="9" fill="#fde68a"/><text x="335" y="119.5" text-anchor="middle" class="svg-ink" font-size="13">MGMT (planned)</text><text x="335" y="136.5" text-anchor="middle" class="svg-muted" font-size="11">role lan | ping h&#116;tps ssh</text><text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">least privilege per interface</text></svg><p class="cap">A role and an allowaccess set chosen for each interface</p></div>
<div class="eg"><p><b>Worked example.</b> An auditor asks "which interfaces can administrators log in on?". You answer from one command per interface, read the allowaccess line, and report that only the MGMT VLAN carries HTTPS and SSH. Roles let the audit table group the interfaces as LAN, WAN and DMZ without extra notes.</p></div>
<div class="warn"><p><b>Common mistake.</b> Using role to "fix" a connectivity problem, or leaving every role undefined. A wrong role will not break forwarding, but it misleads whoever reads the logs and the policy list.</p></div>
<div class="exam"><p><b>Exam trap.</b> The four roles are lan, wan, dmz and undefined. The role does not decide whether NAT happens or which traffic is permitted; policies and routes do.</p></div>
<div class="scn"><h4>The guest VLAN that could ping the firewall</h4><p>A security review found that the Guest VLAN interface allowed ping, HTTPS and SSH because it had been cloned from the Staff VLAN. Guests could see the admin login page. The team removed all allowaccess values from the guest interface, set a role of lan with a clear alias, and wrote a per-VLAN checklist for new interfaces.</p><p><b>Lesson:</b> never clone an interface blindly; set allowaccess deliberately for each VLAN.</p></div>
<div class="iv"><p class="q">"What does the interface role do on a FortiGate?"</p><p>It labels the interface as lan, wan, dmz or undefined. The label affects which options the GUI shows and how the interface appears in logs and views, but it does not change forwarding, NAT or what traffic is allowed. Policies, routes and allowaccess determine behaviour.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles are labels: lan, wan, dmz, undefined.</li>
<li>A role never changes forwarding or NAT.</li>
<li>Set allowaccess deliberately per VLAN; guests get none.</li>
<li>DHCP servers usually sit on LAN-role VLANs (reference configuration).</li>
</ul></div>
`,hi:`
<p>Har interface, physical ya VLAN, ek <b>role</b> rakhta hai. Role ek label hai jo batata hai interface kis kaam ka hai. FortiOS mein chaar values hain: <b>lan</b>, <b>wan</b>, <b>dmz</b> aur <b>undefined</b>. Aap use nse4-setup mein mil chuke ho; yahan yeh isliye matter karta hai kyunki branch mein kai VLAN interfaces ho sakte hain aur labels design ko readable rakhte hain.</p>
<h3>Role kya karta hai aur kya nahi</h3>
<table class="cmp"><tr><th>Role</th><th>Aam use</th><th>Asar</th></tr>
<tr><td>lan</td><td>firewall ke peeche user aur server networks</td><td>internal tag; GUI LAN-style options deta hai jaise DHCP server</td></tr>
<tr><td>wan</td><td>ISP ki taraf links</td><td>external tag; GUI WAN-style options deta hai</td></tr>
<tr><td>dmz</td><td>published servers</td><td>server network tag</td></tr>
<tr><td>undefined</td><td>baaki sab (default)</td><td>koi assumption nahi; GUI saare options dikhata hai</td></tr></table>
<p>Role logs aur GUI views mein dikhta hai, aur GUI kaunse options dikhaye isko influence karta hai. <b>Yeh forwarding kabhi nahi badalta.</b> Packet address aur policy se route aur filter hota hai, role kuch bhi kahe.</p>
<h3>Role set karna aur check karna</h3>
<p>Chapter 2 ke VLAN interfaces <code>set role lan</code> ke saath bane the. Parent aur VLAN ID ke saath asli configuration mein result:</p>
<pre class="code">NK-PUNE-FGT # show system interface VLAN20</pre>
<pre class="out">config system interface
    edit "VLAN20"
        set vdom "root"
        set ip 10.10.20.1 255.255.255.0
        set allowaccess ping
        set alias "Servers"
        set <span class="hl">role lan</span>
        set snmp-index 10
        set interface "port2"
        set vlanid 20
    next
end</pre>
<h3>Har VLAN par administrative access</h3>
<p>Har VLAN interface ka apna <code>allowaccess</code> hota hai. Har VLAN par sab kuch allow karna lubhavna lagta hai; rukiye. Is topology ke liye samajhdaar design:</p>
<ul>
<li><b>VLAN10 Staff:</b> ping taaki users connectivity test kar sakein; management tabhi jab administrators wahan se kaam karte hon.</li>
<li><b>VLAN20 Servers:</b> monitoring ke liye ping; user devices ke liye admin GUI kabhi nahi.</li>
<li><b>Guest VLAN:</b> kuch nahi, ping bhi nahi, taaki guests firewall ko probe na kar sakein.</li>
<li><b>Management:</b> administrators ke liye ek VLAN ya port reserved, HTTPS aur SSH sirf wahan.</li>
</ul>
<p>Lab mein dono VLAN interfaces sirf ping allow karte hain, isliye PC 10.10.10.1 ko ping kar sakta hai par us par admin session nahi khol sakta. Yeh allowaccess apna kaam kar raha hai, per interface.</p>
<p>LAN-role VLAN par aksar DHCP server lagaya jaata hai taaki clients ko addresses apne aap milein. Simulator DHCP servers model nahi karta, isliye yeh reference configuration hai (simulator mein run nahi hui):</p>
<pre class="code"><span class="c">Reference configuration (not run in the simulator)</span>
config system dhcp server
    edit 1
        set interface "VLAN10"
        set default-gateway 10.10.10.1
        set netmask 255.255.255.0
        config ip-range
            edit 1
                set start-ip 10.10.10.100
                set end-ip 10.10.10.199
            next
        end
    next
end</pre>
<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Har interface ke liye chuna role aur allowaccess set"><rect x="10" y="15" width="190" height="55" rx="9" fill="#bbf7d0"/><text x="105" y="39.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10 Staff</text><text x="105" y="56.5" text-anchor="middle" class="svg-muted" font-size="11">role lan | allowaccess ping</text><rect x="10" y="95" width="190" height="55" rx="9" fill="#ddd6fe"/><text x="105" y="119.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20 Servers</text><text x="105" y="136.5" text-anchor="middle" class="svg-muted" font-size="11">role lan | allowaccess ping</text><rect x="240" y="15" width="190" height="55" rx="9" fill="#e2e8f0"/><text x="335" y="39.5" text-anchor="middle" class="svg-ink" font-size="13">port1 WAN</text><text x="335" y="56.5" text-anchor="middle" class="svg-muted" font-size="11">role wan | allowaccess ping</text><rect x="240" y="95" width="190" height="55" rx="9" fill="#fde68a"/><text x="335" y="119.5" text-anchor="middle" class="svg-ink" font-size="13">MGMT (planned)</text><text x="335" y="136.5" text-anchor="middle" class="svg-muted" font-size="11">role lan | ping h&#116;tps ssh</text><text x="540" y="90" text-anchor="middle" class="svg-muted" font-size="12">har interface par least privilege</text></svg><p class="cap">Har interface ke liye chuna role aur allowaccess set</p></div>
<div class="eg"><p><b>Worked example.</b> Auditor poochta hai "kin interfaces par administrators login kar sakte hain?". Aap har interface ke ek command se jawab dete ho, allowaccess line padhte ho, aur batate ho ki sirf MGMT VLAN HTTPS aur SSH carry karta hai. Roles audit table ko extra notes ke bina interfaces ko LAN, WAN aur DMZ mein group karne dete hain.</p></div>
<div class="warn"><p><b>Common mistake.</b> Role se connectivity problem "fix" karna, ya har role undefined chhodna. Galat role forwarding nahi todta, par logs aur policy list padhne wale ko gumraah karta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Chaar roles lan, wan, dmz aur undefined hain. Role tay nahi karta ki NAT hoga ya kaunsa traffic permit hoga; policies aur routes karte hain.</p></div>
<div class="scn"><h4>Guest VLAN jo firewall ko ping kar sakta tha</h4><p>Ek security review ne paya ki Guest VLAN interface ping, HTTPS aur SSH allow karta tha kyunki woh Staff VLAN se clone hua tha. Guests admin login page dekh sakte the. Team ne guest interface se saare allowaccess values hataye, saaf alias ke saath role lan set kiya, aur naye interfaces ke liye per-VLAN checklist likhi.</p><p><b>Lesson:</b> interface ko andhadhund clone mat karo; har VLAN ke liye allowaccess soch-samajhkar set karo.</p></div>
<div class="iv"><p class="q">"FortiGate par interface role kya karta hai?"</p><p>Yeh interface ko lan, wan, dmz ya undefined label karta hai. Label GUI ke options aur logs aur views mein interface ke dikhne ko affect karta hai, par forwarding, NAT ya allowed traffic nahi badalta. Behaviour policies, routes aur allowaccess tay karte hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Roles labels hain: lan, wan, dmz, undefined.</li>
<li>Role kabhi forwarding ya NAT nahi badalta.</li>
<li>Har VLAN ke liye allowaccess soch-samajhkar set karo; guests ko kuch nahi.</li>
<li>DHCP servers aam taur par LAN-role VLANs par hote hain (reference configuration).</li>
</ul></div>
`}};export{e as default};