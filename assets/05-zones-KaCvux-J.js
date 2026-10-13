var e={id:`zones`,h:{en:`Zones: grouping interfaces for policy`,hi:`Zones: policy ke liye interfaces ko group karna`},body:{en:`
<p>A <b>zone</b> is a named group of two or more interfaces. Once interfaces are in a zone, firewall policies refer to the zone instead of to each member. This keeps the policy list short, makes it readable and avoids the "I updated one interface and forgot the other" mistake.</p>
<h3>What a zone is and is not</h3>
<ul>
<li>It groups <b>physical and VLAN interfaces</b> (a zone with VLAN10 and VLAN20 is typical).</li>
<li>Members keep their own IP addresses, subnets and connected routes. A zone does not merge subnets.</li>
<li>A policy that names the zone applies to every member.</li>
<li>An interface can belong to <b>one zone</b> only.</li>
<li>Once an interface is a zone member, you cannot use that interface by name in a policy; you use the zone. FortiOS requires an interface to have no policies of its own before it can join a zone.</li>
</ul>
<p>Creating a zone for the two lab VLANs, with the real session and the result. The first view hides the default; the second reveals it:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
new entry 'LAN-ZONE' added
NK-PUNE-FGT (LAN-ZONE) # set interface VLAN10 VLAN20
NK-PUNE-FGT (LAN-ZONE) # next
NK-PUNE-FGT (zone) # end
NK-PUNE-FGT # show system zone
NK-PUNE-FGT # show full-configuration system zone
NK-PUNE-FGT # get system zone</pre>
<pre class="out">config system zone
    edit "LAN-ZONE"
        set interface "VLAN10" "VLAN20"
    next
end

config system zone
    edit "LAN-ZONE"
        set description ""
        <span class="hl">set intrazone deny</span>
        set interface "VLAN10" "VLAN20"
    next
end

== [ LAN-ZONE ]
name: LAN-ZONE   description:    intrazone: deny</pre>
<p>Three details from the output. The attribute <b>interface</b> holds the member list. The <b>intrazone</b> attribute defaults to <b>deny</b>, and <code>show</code> hides it. The <code>get system zone</code> summary is a quick way to see the zone names and the intrazone value on one line. (As in nse4-setup, <code>set</code> on a list replaces it; to add a member later use <code>append interface VLAN30</code>.)</p>
<h3>Why use a zone?</h3>
<table class="cmp"><tr><th>Without a zone</th><th>With a zone</th></tr>
<tr><td>One policy per interface to reach the internet</td><td>One policy from the zone</td></tr>
<tr><td>New VLAN needs a new policy</td><td>New VLAN joins the zone and inherits the policy</td></tr>
<tr><td>Easy to forget one interface</td><td>Membership is visible in one place</td></tr></table>
<p>Zones also have a drawback: the zone policy gives <b>all members the same permissions</b>. If Staff and Servers need different rules to the internet, keep them as separate interfaces or separate zones.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="A zone groups interfaces; one policy covers both"><rect x="10" y="60" width="130" height="55" rx="9" fill="#bbf7d0"/><text x="75" y="84.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10</text><text x="75" y="101.5" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.1/24</text><rect x="10" y="125" width="130" height="55" rx="9" fill="#ddd6fe"/><text x="75" y="149.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20</text><text x="75" y="166.5" text-anchor="middle" class="svg-muted" font-size="11">10.10.20.1/24</text><rect x="190" y="45" width="170" height="120" rx="9" fill="#fde68a"/><text x="275" y="102" text-anchor="middle" class="svg-ink" font-size="13">LAN-ZONE</text><text x="275" y="119" text-anchor="middle" class="svg-muted" font-size="11">intrazone deny (default)</text><line x1="140" y1="87" x2="190" y2="87" stroke="#64748b" stroke-width="2"/><line x1="140" y1="152" x2="190" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/><text x="400" y="98" text-anchor="middle" class="svg-accent" font-size="11">one policy</text><rect x="440" y="70" width="190" height="70" rx="9" fill="#e2e8f0"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="13">port1 (WAN)</text><text x="535" y="119" text-anchor="middle" class="svg-muted" font-size="11">policy: LAN-ZONE to port1</text></svg><p class="cap">A zone groups interfaces; one policy covers both</p></div>
<div class="eg"><p><b>Worked example.</b> A third VLAN, Printers (VLAN30), must reach the internet with the same rules as Staff and Servers. You create VLAN30, run <code>append interface VLAN30</code> on LAN-ZONE and nothing else. The existing policy now covers it. Without a zone you would copy and edit a policy.</p></div>
<div class="warn"><p><b>Common mistake.</b> Adding an interface that already appears in a firewall policy to a zone. FortiOS expects the interface to have no policy references first; remove or re-point the old policies, then add the member. (The simulator does not enforce this at join time, but it does refuse the interface by name afterwards, as chapter 7 shows.)</p></div>
<div class="exam"><p><b>Exam trap.</b> A zone can hold only interfaces, an interface can be in only one zone, and the default <code>intrazone</code> is deny. A zone does not create a VLAN or change any IP address.</p></div>
<div class="scn"><h4>One policy for five VLANs</h4><p>A school had five classroom VLANs, each with identical internet access. The first design had five policies; every filtering change had to be made five times and twice a term one was missed. Grouping the VLANs into a CLASSROOMS zone reduced it to one policy and one place to audit.</p><p><b>Lesson:</b> zones are for interfaces that share the same permissions.</p></div>
<div class="iv"><p class="q">"What is a zone and when would you use one?"</p><p>A zone is a named group of interfaces, physical or VLAN, that policies can reference as one. I use it when several interfaces need identical permissions, such as multiple user VLANs reaching the internet. Members keep their own addresses, an interface can be in one zone only, and the intrazone setting controls traffic between members.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A zone groups interfaces so one policy covers all members.</li>
<li>Members keep their own IPs; an interface is in one zone only.</li>
<li>intrazone defaults to deny and is hidden by show.</li>
<li>Use separate zones when members need different permissions.</li>
</ul></div>
`,hi:`
<p><b>Zone</b> do ya zyada interfaces ka naamit group hai. Interfaces zone mein aa jaayein to firewall policies har member ki jagah zone ko refer karti hain. Isse policy list chhoti rehti hai, readable hoti hai aur "ek interface update kiya aur doosra bhool gaya" galti se bachati hai.</p>
<h3>Zone kya hai aur kya nahi</h3>
<ul>
<li>Yeh <b>physical aur VLAN interfaces</b> ko group karta hai (VLAN10 aur VLAN20 wala zone aam hai).</li>
<li>Members apne IP addresses, subnets aur connected routes rakhte hain. Zone subnets ko merge nahi karta.</li>
<li>Zone ka naam lene wali policy har member par lagu hoti hai.</li>
<li>Ek interface sirf <b>ek zone</b> ka member ho sakta hai.</li>
<li>Interface zone member ban jaaye to use policy mein naam se use nahi kar sakte; zone use karte hain. FortiOS chahta hai ki zone mein judne se pehle interface ki apni koi policy na ho.</li>
</ul>
<p>Lab ke do VLANs ke liye zone banana, asli session aur result ke saath. Pehla view default chhupata hai; doosra dikhata hai:</p>
<pre class="code">NK-PUNE-FGT # config system zone
NK-PUNE-FGT (zone) # edit LAN-ZONE
new entry 'LAN-ZONE' added
NK-PUNE-FGT (LAN-ZONE) # set interface VLAN10 VLAN20
NK-PUNE-FGT (LAN-ZONE) # next
NK-PUNE-FGT (zone) # end
NK-PUNE-FGT # show system zone
NK-PUNE-FGT # show full-configuration system zone
NK-PUNE-FGT # get system zone</pre>
<pre class="out">config system zone
    edit "LAN-ZONE"
        set interface "VLAN10" "VLAN20"
    next
end

config system zone
    edit "LAN-ZONE"
        set description ""
        <span class="hl">set intrazone deny</span>
        set interface "VLAN10" "VLAN20"
    next
end

== [ LAN-ZONE ]
name: LAN-ZONE   description:    intrazone: deny</pre>
<p>Output ki teen details. <b>interface</b> attribute member list rakhta hai. <b>intrazone</b> attribute ka default <b>deny</b> hai, aur <code>show</code> use chhupata hai. <code>get system zone</code> summary zone names aur intrazone value ek line mein dekhne ka tez tareeka hai. (nse4-setup ki tarah, list par <code>set</code> use replace karta hai; baad mein member jodne ke liye <code>append interface VLAN30</code> use karo.)</p>
<h3>Zone kyun use karein?</h3>
<table class="cmp"><tr><th>Zone ke bina</th><th>Zone ke saath</th></tr>
<tr><td>Internet tak jaane ke liye har interface ki ek policy</td><td>Zone se ek policy</td></tr>
<tr><td>Naye VLAN ko nayi policy chahiye</td><td>Naya VLAN zone join karta hai aur policy inherit karta hai</td></tr>
<tr><td>Ek interface bhoolna aasaan</td><td>Membership ek jagah dikhti hai</td></tr></table>
<p>Zones ka ek nuksaan bhi hai: zone policy <b>saare members ko same permissions</b> deti hai. Staff aur Servers ko internet tak alag rules chahiye to unhe alag interfaces ya alag zones rakho.</p>
<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Zone interfaces ko group karta hai; ek policy dono ko cover karti hai"><rect x="10" y="60" width="130" height="55" rx="9" fill="#bbf7d0"/><text x="75" y="84.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN10</text><text x="75" y="101.5" text-anchor="middle" class="svg-muted" font-size="11">10.10.10.1/24</text><rect x="10" y="125" width="130" height="55" rx="9" fill="#ddd6fe"/><text x="75" y="149.5" text-anchor="middle" class="svg-ink" font-size="13">VLAN20</text><text x="75" y="166.5" text-anchor="middle" class="svg-muted" font-size="11">10.10.20.1/24</text><rect x="190" y="45" width="170" height="120" rx="9" fill="#fde68a"/><text x="275" y="102" text-anchor="middle" class="svg-ink" font-size="13">LAN-ZONE</text><text x="275" y="119" text-anchor="middle" class="svg-muted" font-size="11">intrazone deny (default)</text><line x1="140" y1="87" x2="190" y2="87" stroke="#64748b" stroke-width="2"/><line x1="140" y1="152" x2="190" y2="130" stroke="#64748b" stroke-width="2"/><line x1="360" y1="105" x2="440" y2="105" stroke="#64748b" stroke-width="2"/><text x="400" y="98" text-anchor="middle" class="svg-accent" font-size="11">ek policy</text><rect x="440" y="70" width="190" height="70" rx="9" fill="#e2e8f0"/><text x="535" y="102" text-anchor="middle" class="svg-ink" font-size="13">port1 (WAN)</text><text x="535" y="119" text-anchor="middle" class="svg-muted" font-size="11">policy: LAN-ZONE to port1</text></svg><p class="cap">Zone interfaces ko group karta hai; ek policy dono ko cover karti hai</p></div>
<div class="eg"><p><b>Worked example.</b> Teesre VLAN, Printers (VLAN30), ko Staff aur Servers jaise hi rules ke saath internet tak jaana hai. Aap VLAN30 banate ho, LAN-ZONE par <code>append interface VLAN30</code> chalate ho aur kuch nahi. Maujooda policy ab use cover karti hai. Zone ke bina aap policy copy aur edit karte.</p></div>
<div class="warn"><p><b>Common mistake.</b> Aisa interface zone mein jodna jo pehle se firewall policy mein hai. FortiOS expect karta hai ki interface ka koi policy reference na ho; pehle purani policies hatao ya re-point karo, phir member jodo. (Simulator join ke samay yeh enforce nahi karta, par baad mein interface ko naam se refuse karta hai, jaise chapter 7 dikhata hai.)</p></div>
<div class="exam"><p><b>Exam trap.</b> Zone sirf interfaces rakh sakta hai, interface sirf ek zone mein ho sakta hai, aur default <code>intrazone</code> deny hai. Zone VLAN nahi banata aur kisi IP address ko nahi badalta.</p></div>
<div class="scn"><h4>Paanch VLANs ke liye ek policy</h4><p>Ek school mein paanch classroom VLANs the, sabka internet access ek jaisa. Pehle design mein paanch policies thi; har filtering change paanch baar karna padta tha aur har term mein do baar ek chhoot jaati thi. VLANs ko CLASSROOMS zone mein group karne se ek policy aur audit ke liye ek jagah ho gayi.</p><p><b>Lesson:</b> zones un interfaces ke liye hain jo same permissions share karte hain.</p></div>
<div class="iv"><p class="q">"Zone kya hai aur kab use karoge?"</p><p>Zone interfaces ka naamit group hai, physical ya VLAN, jise policies ek ki tarah refer kar sakti hain. Main use tab karta hoon jab kai interfaces ko identical permissions chahiye, jaise kai user VLANs ka internet tak jaana. Members apne addresses rakhte hain, interface sirf ek zone mein ho sakta hai, aur intrazone setting members ke beech ke traffic ko control karti hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Zone interfaces ko group karta hai taaki ek policy sab members ko cover kare.</li>
<li>Members apne IP rakhte hain; interface sirf ek zone mein.</li>
<li>intrazone ka default deny hai aur show use chhupata hai.</li>
<li>Members ko alag permissions chahiye to alag zones use karo.</li>
</ul></div>
`}};export{e as default};