var e={id:`members-zones`,h:{en:`SD-WAN members and zones`,hi:`SD-WAN members aur zones`},body:{en:`
<p>A <b>member</b> is a single WAN link described by an interface and, normally, the gateway of that link. A physical port, a VLAN, an aggregate or an IPsec tunnel interface can be a member. A <b>zone</b> is a named group of members. Out of the box FortiOS has one zone called <code>virtual-wan-link</code>; you can create more, for example <code>UNDERLAY</code> for ISP links and <code>OVERLAY</code> for VPN tunnels, so that rules and policies can address them separately.</p>
<pre class="code"><span class="c">! Try it: lab "Two ISPs become one SD-WAN zone"</span>
config system sdwan
    set status enable
    config zone
        edit "virtual-wan-link"
        next
    end
    config members
        edit 1
            set interface "port1"
            set zone "virtual-wan-link"
            set gateway 203.0.113.1
        next
        edit 2
            set interface "port4"
            set zone "virtual-wan-link"
            set gateway 198.51.100.1
            set cost 10
        next
    end
end</pre>
<p>The addresses are the same as the Pune branch of nse4-routing: ISP-A on port1 (203.0.113.2/30, gateway 203.0.113.1) and ISP-B on port4 (198.51.100.2/30, gateway 198.51.100.1). The member number is only an ID; it is the number you use later in rules and health checks.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="20" y="20" width="600" height="160" rx="10" fill="#e2e8f0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13"></text><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN: config system sdwan</text><rect x="40" y="60" width="270" height="100" rx="10" fill="#ddd6fe"/><text x="175" y="107" text-anchor="middle" class="svg-ink" font-size="13">zone: UNDERLAY</text><text x="175" y="124" text-anchor="middle" class="svg-muted" font-size="11">ISP links</text><rect x="60" y="95" width="110" height="45" rx="10" fill="#bbf7d0"/><text x="115" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">port1</text><text x="115" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">ISP-A</text><rect x="180" y="95" width="110" height="45" rx="10" fill="#fde68a"/><text x="235" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">port4</text><text x="235" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">ISP-B</text><rect x="330" y="60" width="270" height="100" rx="10" fill="#bae6fd"/><text x="465" y="107" text-anchor="middle" class="svg-ink" font-size="13">zone: OVERLAY</text><text x="465" y="124" text-anchor="middle" class="svg-muted" font-size="11">VPN tunnels</text><rect x="350" y="95" width="110" height="45" rx="10" fill="#fed7aa"/><text x="405" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">HUB1-T1</text><text x="405" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">IPsec</text><rect x="470" y="95" width="110" height="45" rx="10" fill="#fed7aa"/><text x="525" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">HUB1-T2</text><text x="525" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">IPsec</text></svg><p class="cap">Two zones: rules can target ISP links and VPN tunnels separately.</p></div>
<h3>Member attributes that matter</h3>
<table class="cmp"><tr><th>Attribute</th><th>Meaning</th></tr><tr><td><code>interface</code></td><td>The port, VLAN, aggregate or tunnel interface.</td></tr><tr><td><code>zone</code></td><td>The zone this member belongs to; default virtual-wan-link.</td></tr><tr><td><code>gateway</code></td><td>Next hop of this link. Not needed for DHCP or PPPoE links, which learn it.</td></tr><tr><td><code>cost</code></td><td>Used by the cost-based strategy (lowest cost link preferred).</td></tr><tr><td><code>priority</code></td><td>Preference of the member when the routing table must pick one.</td></tr><tr><td><code>weight</code></td><td>Share of sessions in weight-based load balancing.</td></tr><tr><td><code>status</code></td><td>enable or disable the member without deleting it.</td></tr></table>
<h3>The reference rule: clean the interface first</h3>
<p>An interface cannot join SD-WAN while other parts of the configuration still use it by name. Before adding port1 and port4 as members you must remove or move every reference: static routes that point to the port, firewall policies that use it as source or destination, DHCP servers, and similar objects. Typical order of work on an existing branch:</p>
<ol><li>Note existing routes, policies and NAT that use port1 and port4.</li><li>Delete the old default routes and the policy entries that name those ports.</li><li>Create the members and zone.</li><li>Create one default route for the zone and one policy to the zone (next chapter).</li><li>Test from a client, then add health checks and rules.</li></ol>
<div class="warn"><p><b>Common mistake.</b> Doing this on a production firewall without a maintenance window or console access. The moment the old routes and policies are removed, traffic stops until the new ones exist. Prepare the whole change, apply it quickly, or use a staging unit.</p></div>
<div class="exam"><p><b>Exam trap.</b> Know why an interface cannot be added as a member while it is referenced by a route, policy or DHCP server, and that the default zone is <code>virtual-wan-link</code>.</p></div>
<div class="scn"><h4>The member that would not save</h4><p>An engineer added port4 as a member and the unit refused with an error that the interface was in use. A forgotten guest policy still listed port4 as destination. After removing that policy entry and recreating it against the zone, the member saved.</p><p><b>Lesson:</b> Search the configuration for every use of an interface before turning it into a member.</p></div>
<div class="iv"><p class="q">"What is an SD-WAN zone and why use more than one?"</p><p>A zone is a named group of members that routes and policies refer to. Separate zones, for example underlay ISP links and overlay VPN tunnels, let rules and policies treat them differently and make it easy to keep internet-bound and site-to-site traffic apart.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A member is an interface plus usually its gateway; members live in zones.</li><li>The default zone is virtual-wan-link; extra zones separate underlay and overlay.</li><li>Cost, priority and weight feed strategies and load balancing.</li><li>Remove references to an interface before adding it as a member.</li></ul></div>
`,hi:`
<p><b>Member</b> ek WAN link hai jo interface aur aam taur par us link ke gateway se describe hoti hai. Physical port, VLAN, aggregate ya IPsec tunnel interface member ho sakta hai. <b>Zone</b> members ka naam wala group hai. FortiOS mein default roop se ek zone <code>virtual-wan-link</code> hota hai; aap aur bana sakte ho, jaise ISP links ke liye <code>UNDERLAY</code> aur VPN tunnels ke liye <code>OVERLAY</code>, taaki rules aur policies unhe alag-alag address kar saken.</p>
<pre class="code"><span class="c">! Try it: lab "Do ISPs ek SD-WAN zone bante hain"</span>
config system sdwan
    set status enable
    config zone
        edit "virtual-wan-link"
        next
    end
    config members
        edit 1
            set interface "port1"
            set zone "virtual-wan-link"
            set gateway 203.0.113.1
        next
        edit 2
            set interface "port4"
            set zone "virtual-wan-link"
            set gateway 198.51.100.1
            set cost 10
        next
    end
end</pre>
<p>Addresses wahi hain jo nse4-routing ke Pune branch mein the: port1 par ISP-A (203.0.113.2/30, gateway 203.0.113.1) aur port4 par ISP-B (198.51.100.2/30, gateway 198.51.100.1). Member number sirf ID hai; yahi number aap baad mein rules aur health checks mein use karte ho.</p>
<div class="dia"><svg viewBox="0 0 640 200" role="img" aria-label="diagram"><rect x="20" y="20" width="600" height="160" rx="10" fill="#e2e8f0"/><text x="320" y="105" text-anchor="middle" class="svg-ink" font-size="13"></text><text x="320" y="42" text-anchor="middle" class="svg-ink" font-size="13">SD-WAN: config system sdwan</text><rect x="40" y="60" width="270" height="100" rx="10" fill="#ddd6fe"/><text x="175" y="107" text-anchor="middle" class="svg-ink" font-size="13">zone: UNDERLAY</text><text x="175" y="124" text-anchor="middle" class="svg-muted" font-size="11">ISP links</text><rect x="60" y="95" width="110" height="45" rx="10" fill="#bbf7d0"/><text x="115" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">port1</text><text x="115" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">ISP-A</text><rect x="180" y="95" width="110" height="45" rx="10" fill="#fde68a"/><text x="235" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">port4</text><text x="235" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">ISP-B</text><rect x="330" y="60" width="270" height="100" rx="10" fill="#bae6fd"/><text x="465" y="107" text-anchor="middle" class="svg-ink" font-size="13">zone: OVERLAY</text><text x="465" y="124" text-anchor="middle" class="svg-muted" font-size="11">VPN tunnels</text><rect x="350" y="95" width="110" height="45" rx="10" fill="#fed7aa"/><text x="405" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">HUB1-T1</text><text x="405" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">IPsec</text><rect x="470" y="95" width="110" height="45" rx="10" fill="#fed7aa"/><text x="525" y="114.5" text-anchor="middle" class="svg-ink" font-size="13">HUB1-T2</text><text x="525" y="131.5" text-anchor="middle" class="svg-muted" font-size="11">IPsec</text></svg><p class="cap">Do zones: rules ISP links aur VPN tunnels ko alag-alag target kar sakte hain.</p></div>
<h3>Zaroori member attributes</h3>
<table class="cmp"><tr><th>Attribute</th><th>Matlab</th></tr><tr><td><code>interface</code></td><td>Port, VLAN, aggregate ya tunnel interface.</td></tr><tr><td><code>zone</code></td><td>Member jis zone ka hai; default virtual-wan-link.</td></tr><tr><td><code>gateway</code></td><td>Is link ka next hop. DHCP ya PPPoE links ko zaroori nahi, ve khud seekhte hain.</td></tr><tr><td><code>cost</code></td><td>Cost-based strategy use karti hai (sabse kam cost wala link prefer).</td></tr><tr><td><code>priority</code></td><td>Jab routing table ko ek chunna ho to member ki preference.</td></tr><tr><td><code>weight</code></td><td>Weight-based load balancing mein sessions ka hissa.</td></tr><tr><td><code>status</code></td><td>Member ko delete kiye bina enable ya disable karo.</td></tr></table>
<h3>Reference rule: pehle interface saaf karo</h3>
<p>Interface tab tak SD-WAN mein nahi jud sakta jab tak configuration ke doosre hisse use naam se use kar rahe hon. port1 aur port4 ko members banane se pehle har reference hatana ya move karna padta hai: port ki taraf point karne wale static routes, jo policies use source ya destination banati hain, DHCP servers aur isi tarah ke objects. Existing branch par kaam ka typical order:</p>
<ol><li>Port1 aur port4 use karne wale routes, policies aur NAT note karo.</li><li>Purane default routes aur un ports ko naam se use karne wali policy entries delete karo.</li><li>Members aur zone banao.</li><li>Zone ke liye ek default route aur zone ki ek policy banao (agla chapter).</li><li>Client se test karo, phir health checks aur rules jodo.</li></ol>
<div class="warn"><p><b>Common galti.</b> Production firewall par maintenance window ya console access ke bina yeh karna. Jaise hi purane routes aur policies hatte hain, naye banne tak traffic ruk jaata hai. Poora change taiyaar rakho, jaldi apply karo, ya staging unit use karo.</p></div>
<div class="exam"><p><b>Exam trap.</b> Jaano ki route, policy ya DHCP server se referenced hone par interface member kyun nahi ban sakta, aur default zone <code>virtual-wan-link</code> hai.</p></div>
<div class="scn"><h4>Member jo save nahi hota tha</h4><p>Engineer ne port4 ko member banaya aur unit ne error ke saath mana kar diya ki interface use mein hai. Bhooli hui guest policy ab bhi port4 ko destination dikha rahi thi. Us policy entry ko hatakar zone ke against dobara banane par member save ho gaya.</p><p><b>Seekh:</b> Interface ko member banane se pehle configuration mein uske har use ko dhoondo.</p></div>
<div class="iv"><p class="q">"SD-WAN zone kya hai aur ek se zyada kyun use karte hain?"</p><p>Zone members ka naam wala group hai jise routes aur policies refer karte hain. Alag zones, jaise underlay ISP links aur overlay VPN tunnels, rules aur policies ko unhe alag treat karne dete hain aur internet-bound aur site-to-site traffic ko alag rakhna aasan banate hain.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Member interface plus aam taur par uska gateway hai; members zones mein rehte hain.</li><li>Default zone virtual-wan-link hai; extra zones underlay aur overlay ko alag karte hain.</li><li>Cost, priority aur weight strategies aur load balancing ko feed karte hain.</li><li>Interface ko member banane se pehle uske references hatao.</li></ul></div>
`}};export{e as default};