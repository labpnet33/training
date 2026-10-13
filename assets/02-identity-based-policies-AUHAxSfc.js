var e={id:`identity-policies`,h:{en:`Identity-based policies: users and groups in a rule`,hi:`Identity-based policies: rule mein users aur groups`},body:{en:`
<p>An identity-based policy is a normal firewall policy with one extra condition: the traffic must belong to a listed user or group. If the source address matches but the person has not authenticated, or belongs to a different group, the policy is skipped and the next one is tried. That makes <b>policy order</b> even more important than before, which you already studied in nse4-policy.</p>
<div class="note"><p><b>Reference only.</b> User and group objects cannot be created in the simulator. The blocks below are <b>Reference configuration (not run in the simulator)</b>; the order and lookup ideas are the same ones you practised with address-based policies.</p></div>

<h3>Users, groups, and where they plug in</h3>
<ul>
<li><b>User</b>: one account (<code>config user local</code> for local accounts, or a remote account found through LDAP or RADIUS).</li>
<li><b>Group</b>: a bundle of users (<code>config user group</code>). Policies use groups far more than single users, because group membership is easy to change.</li>
<li><b>Policy</b>: <code>set groups</code> or <code>set users</code> lists them as part of the match.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Policy matching with groups">
<rect x="10" y="60" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="13">Packet</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">source LAN_NET</text>
<rect x="200" y="20" width="200" height="50" rx="10" fill="#ddd6fe"/><text x="300" y="50" text-anchor="middle" class="svg-ink" font-size="13">Policy 20: group FINANCE</text>
<rect x="200" y="110" width="200" height="50" rx="10" fill="#ddd6fe"/><text x="300" y="140" text-anchor="middle" class="svg-ink" font-size="13">Policy 30: group STAFF</text>
<rect x="450" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Finance member: match</text>
<rect x="450" y="110" width="170" height="50" rx="10" fill="#fde68a"/><text x="535" y="140" text-anchor="middle" class="svg-ink" font-size="13">Others: next policy</text>
<line x1="150" y1="90" x2="200" y2="45" stroke="#64748b" stroke-width="2"/><line x1="150" y1="90" x2="200" y2="135" stroke="#64748b" stroke-width="2"/><line x1="400" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><line x1="400" y1="135" x2="450" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">A packet only matches the policy whose group contains its authenticated user.</p></div>

<h3>Layering access by group</h3>
<p>A common design is to put the narrowest group first and the broader group below it:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 20
        set name "FINANCE-TO-PAYROLL"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "PAYROLL-SRV"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "FINANCE-USERS"
        set logtraffic all
    next
    edit 30
        set name "STAFF-TO-INTERNET"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "LAN_NET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set groups "STAFF"
        set nat enable
        set logtraffic all
    next
end</pre>
<p>Policy 20 serves Finance members who need the payroll server. Policy 30 gives every staff member internet access with NAT. A person in both groups can match either, so the order and the destination decide the result.</p>

<h3>Behaviour you need to remember</h3>
<ul>
<li>The user must have authenticated before the policy can match. How that happens depends on the method (prompt, portal or FSSO).</li>
<li>Several groups in one policy are alternatives: membership in any one is enough.</li>
<li>Users and groups are checked together with the address, interface, service and schedule. All must match.</li>
<li>Logs show the user name, which turns an address into evidence of who did what.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Rohit is in STAFF only. He opens the payroll site from the LAN. Policy 20 needs FINANCE-USERS, so it is skipped. Nothing else allows that destination for him, and the implicit deny drops the traffic. When he is added to FINANCE-USERS, policy 20 matches on the next new session.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Placing a broad "all users" policy above the narrow group policy so the narrow one never matches; listing a user who has never authenticated and wondering why nothing matches; mixing authenticated and unauthenticated traffic in one policy; forgetting that a group change applies only to new sessions or after the user re-authenticates.</p></div>
<div class="exam"><p><b>Exam trap.</b> Identity-based policies still follow top-down, first-match order. A policy that lists a group is only a candidate when the user has an identity. Unauthenticated traffic skips it and falls through to later policies, or to the implicit deny.</p></div>

<div class="scn"><h4>The invisible new hire</h4><p>A new accountant could open the internet but not the payroll server. Her account was in STAFF but had not been added to FINANCE-USERS, so policy 20 never matched for her. The helpdesk added her to the group; a fresh connection then worked. The ticket note recorded the group change and the test result, not just "fixed".</p><p><b>Lesson:</b> when a person has some access but not all, check group membership first.</p></div>

<div class="iv"><p class="q">"How does a FortiGate decide which identity-based policy applies to a user?"</p><p>It evaluates policies top-down. A policy matches only if interfaces, addresses, service, schedule and the user's group all match. A user who has not authenticated cannot match a group policy and falls through. Order narrow groups before broad ones, and mention that logs record the user name.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>An identity-based policy adds users or groups to the normal match conditions.</li>
<li>Groups are better than single users for maintenance.</li>
<li>Top-down order still applies; put narrow groups above broad ones.</li>
<li>Unauthenticated traffic skips group policies.</li>
</ul></div>
`,hi:`
<p>Identity-based policy normal firewall policy hai jisme ek extra condition hoti hai: traffic kisi listed user ya group ka hona chahiye. Agar source address match kare lekin insaan ne authenticate nahi kiya, ya woh kisi aur group mein hai, to policy skip hoti hai aur agli try hoti hai. Isse <b>policy order</b> pehle se bhi zyada important ho jaata hai, jo aapne nse4-policy mein padha hai.</p>
<div class="note"><p><b>Reference only.</b> User aur group objects simulator mein nahi ban sakte. Neeche ke blocks <b>Reference configuration (not run in the simulator)</b> hain; order aur lookup ke ideas wahi hain jo aapne address-based policies ke saath practise kiye.</p></div>

<h3>Users, groups, aur woh kahan judte hain</h3>
<ul>
<li><b>User</b>: ek account (local accounts ke liye <code>config user local</code>, ya LDAP ya RADIUS se mila remote account).</li>
<li><b>Group</b>: users ka bundle (<code>config user group</code>). Policies single users se zyada groups use karti hain, kyunki group membership badalna aasaan hai.</li>
<li><b>Policy</b>: <code>set groups</code> ya <code>set users</code> unhe match ka hissa banata hai.</li>
</ul>

<div class="dia"><svg viewBox="0 0 640 190" role="img" aria-label="Policy matching with groups">
<rect x="10" y="60" width="140" height="60" rx="10" fill="#bae6fd"/><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="13">Packet</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">source LAN_NET</text>
<rect x="200" y="20" width="200" height="50" rx="10" fill="#ddd6fe"/><text x="300" y="50" text-anchor="middle" class="svg-ink" font-size="13">Policy 20: group FINANCE</text>
<rect x="200" y="110" width="200" height="50" rx="10" fill="#ddd6fe"/><text x="300" y="140" text-anchor="middle" class="svg-ink" font-size="13">Policy 30: group STAFF</text>
<rect x="450" y="20" width="170" height="50" rx="10" fill="#bbf7d0"/><text x="535" y="50" text-anchor="middle" class="svg-ink" font-size="13">Finance member: match</text>
<rect x="450" y="110" width="170" height="50" rx="10" fill="#fde68a"/><text x="535" y="140" text-anchor="middle" class="svg-ink" font-size="13">Baaki: agli policy</text>
<line x1="150" y1="90" x2="200" y2="45" stroke="#64748b" stroke-width="2"/><line x1="150" y1="90" x2="200" y2="135" stroke="#64748b" stroke-width="2"/><line x1="400" y1="45" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><line x1="400" y1="135" x2="450" y2="135" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Packet sirf us policy se match karta hai jiske group mein uska authenticated user ho.</p></div>

<h3>Group se access layer karna</h3>
<p>Aam design mein sabse narrow group pehle aur broad group uske neeche rakhte hain:</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall policy
    edit 20
        set name "FINANCE-TO-PAYROLL"
        set srcintf "port2"
        set dstintf "port3"
        set srcaddr "LAN_NET"
        set dstaddr "PAYROLL-SRV"
        set action accept
        set schedule "always"
        set service "HTTPS"
        set groups "FINANCE-USERS"
        set logtraffic all
    next
    edit 30
        set name "STAFF-TO-INTERNET"
        set srcintf "port2"
        set dstintf "port1"
        set srcaddr "LAN_NET"
        set dstaddr "all"
        set action accept
        set schedule "always"
        set service "ALL"
        set groups "STAFF"
        set nat enable
        set logtraffic all
    next
end</pre>
<p>Policy 20 un Finance members ke liye hai jinhe payroll server chahiye. Policy 30 har staff member ko NAT ke saath internet access deti hai. Dono groups mein rehne wala insaan dono match kar sakta hai, isliye order aur destination result decide karte hain.</p>

<h3>Yaad rakhne wala behaviour</h3>
<ul>
<li>Policy match hone se pehle user ko authenticate hona hoga. Yeh kaise hota hai method par depend karta hai (prompt, portal ya FSSO).</li>
<li>Ek policy mein kai groups alternatives hain: kisi ek ki membership kaafi hai.</li>
<li>Users aur groups address, interface, service aur schedule ke saath check hote hain. Sab match hone chahiye.</li>
<li>Logs user ka naam dikhate hain, jisse address ek saboot ban jaata hai ki kisne kya kiya.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Rohit sirf STAFF mein hai. Woh LAN se payroll site kholta hai. Policy 20 ko FINANCE-USERS chahiye, isliye skip hoti hai. Uske liye us destination ko koi aur allow nahi karta, aur implicit deny traffic drop karta hai. Jab use FINANCE-USERS mein add karte hain, agle naye session par policy 20 match karti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Narrow group policy ke upar broad "all users" policy rakhna taaki narrow kabhi match na kare; aise user ko list karna jisne kabhi authenticate nahi kiya aur sochna ki kuch match kyun nahi hota; authenticated aur unauthenticated traffic ko ek policy mein milana; bhoolna ki group change sirf naye sessions par ya user ke dobara authenticate karne ke baad lagta hai.</p></div>
<div class="exam"><p><b>Exam trap.</b> Identity-based policies bhi upar se neeche, first-match order follow karti hain. Group list karne wali policy tabhi candidate hai jab user ki identity ho. Unauthenticated traffic use skip karke baad ki policies ya implicit deny par girta hai.</p></div>

<div class="scn"><h4>Invisible new hire</h4><p>Ek naya accountant internet khol sakti thi lekin payroll server nahi. Uska account STAFF mein tha lekin FINANCE-USERS mein add nahi hua tha, isliye policy 20 uske liye kabhi match nahi hui. Helpdesk ne use group mein add kiya; fresh connection kaam kar gaya. Ticket note mein group change aur test result likha gaya, sirf "fixed" nahi.</p><p><b>Lesson:</b> jab kisi ko kuch access ho lekin sab nahi, pehle group membership check karo.</p></div>

<div class="iv"><p class="q">"FortiGate kaise decide karta hai ki user par kaunsi identity-based policy lagegi?"</p><p>Woh policies upar se neeche evaluate karta hai. Policy tabhi match karti hai jab interfaces, addresses, service, schedule aur user ka group sab match karein. Jis user ne authenticate nahi kiya woh group policy match nahi kar sakta aur aage gir jaata hai. Narrow groups broad se pehle rakho, aur batao ki logs user name record karte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Identity-based policy normal match conditions mein users ya groups jodti hai.</li>
<li>Maintenance ke liye groups single users se behtar hain.</li>
<li>Top-down order lagta hai; narrow groups broad se upar rakho.</li>
<li>Unauthenticated traffic group policies skip karta hai.</li>
</ul></div>
`}};export{e as default};