var e={id:`objects`,h:{en:`Objects: addresses, services, groups and schedules`,hi:`Objects: addresses, services, groups aur schedules`},body:{en:`
<p>Think of objects as <b>contacts in your phone</b>. You do not dial 10.0.1.0/24 every time; you pick "LAN_NET". If the subnet changes, you edit one contact and every policy that uses it follows. Good objects make policies short, readable and safe to change.</p>

<h3>Address objects</h3>
<p>An address object describes who or where. FortiOS has a built-in object called <code>all</code> (any address) and <code>none</code>. Everything else you create under <code>config firewall address</code>. Common types:</p>
<table class="cmp"><tr><th>Type</th><th>Key setting</th><th>Use</th></tr>
<tr><td>subnet (default)</td><td><code>set subnet 10.0.1.0 255.255.255.0</code></td><td>a LAN, or a /32 for one host</td></tr>
<tr><td>iprange</td><td><code>set type iprange</code>, <code>start-ip</code>, <code>end-ip</code></td><td>a DHCP scope, a block of servers</td></tr>
<tr><td>fqdn</td><td><code>set type fqdn</code>, <code>set fqdn social.example</code></td><td>a name resolved by the FortiGate DNS</td></tr>
<tr><td>geography</td><td><code>set type geography</code>, <code>set country IN</code></td><td>block or allow by country</td></tr>
<tr><td>wildcard-fqdn</td><td><code>set type wildcard-fqdn</code></td><td>any host in a domain (policy source or destination)</td></tr></table>
<pre class="code">config firewall address
    edit "LAN_NET"
        set subnet 10.0.1.0 255.255.255.0
    next
    edit "DNS_GOOGLE"
        set type iprange
        set start-ip 8.8.8.8
        set end-ip 8.8.8.8
    next
end</pre>
<pre class="out">FGT1 # show firewall address
config firewall address
    edit "none"
        set subnet 0.0.0.0 255.255.255.255
    next
    edit "all"
    next
    edit "LAN_NET"
        set subnet 10.0.1.0 255.255.255.0
    next
    edit "DNS_GOOGLE"
        set type iprange
        set start-ip 8.8.8.8
        set end-ip 8.8.8.8
    next
end</pre>
<p>The built-in <code>all</code> and <code>none</code> are always present. An object can also be a <b>group</b>: <code>config firewall addrgrp</code> with <code>set member</code>. A group can hold addresses and other groups, so you can build "BLOCKED" out of several sites.</p>
<pre class="out">FGT1 # show firewall addrgrp
config firewall addrgrp
    edit "BLOCKED"
        set member "SOCIAL_SITE"
    next
end</pre>

<h3>Service objects</h3>
<p>A service object describes a protocol and the <b>destination</b> port(s). FortiOS ships dozens of predefined services (HTTP, HTTPS, DNS, PING, SSH, SMTP, RDP and more). Create your own under <code>config firewall service custom</code> when an application uses an unusual port.</p>
<pre class="code">config firewall service custom
    edit "TCP-8443"
        set tcp-portrange 8443
    next
end
config firewall service group
    edit "WEB-DNS-PING"
        set member HTTP HTTPS DNS PING
    end</pre>
<pre class="out">FGT1 # show firewall service group
config firewall service group
    edit "Email Access"
        set member "DNS" "IMAP" "IMAPS" "POP3" "POP3S" "SMTP" "SMTPS"
    next
    edit "Web Access"
        set member "DNS" "HTTP" "HTTPS"
    next
    edit "WEB-DNS-PING"
        set member "HTTP" "HTTPS" "DNS" "PING"
    next
end</pre>
<p>Notice <code>PING</code> is an ICMP service (type 8, echo request), <code>HTTP</code> is TCP 80 and <code>HTTPS</code> is TCP 443. A port range can also be written <code>tcp-portrange 8000-8100</code>. <code>ALL</code> means every protocol and is almost never right in a production allow rule.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Objects feed a policy">
<rect x="10" y="15" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">Address LAN_NET</text>
<rect x="10" y="65" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">Group BLOCKED</text>
<rect x="10" y="115" width="170" height="40" rx="8" fill="#fde68a"/><text x="95" y="140" text-anchor="middle" class="svg-ink" font-size="13">Service WEB-DNS-PING</text>
<rect x="250" y="30" width="170" height="100" rx="10" fill="#ddd6fe"/><text x="335" y="70" text-anchor="middle" class="svg-ink" font-size="14">Policy LAN-to-WAN</text><text x="335" y="92" text-anchor="middle" class="svg-muted" font-size="12">uses names, not IPs</text>
<rect x="490" y="55" width="140" height="50" rx="10" fill="#bae6fd"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">Schedule always</text>
<line x1="180" y1="35" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="180" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="135" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="490" y1="80" x2="420" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Edit an object once and every policy that references it follows.</p></div>

<h3>Schedules</h3>
<p>A schedule limits when a policy is active. The built-in <code>always</code> is the default. A <b>recurring</b> schedule repeats on chosen weekdays and times (<code>config firewall schedule recurring</code>), a <b>one-time</b> schedule runs between two dates (<code>config firewall schedule onetime</code>), and schedule groups combine them. The schedule commands are not available in the simulator, so this is a reference configuration (not run in the simulator):</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall schedule recurring
    edit "OFFICE-HOURS"
        set day monday tuesday wednesday thursday friday
        set start 09:00
        set end 18:00
    next
end</pre>
<p>A policy that uses OFFICE-HOURS matches only inside that window. Outside it, the policy is skipped and the next one is tried. Sessions that already exist are not torn down at 18:00 by default, because policy is checked for new sessions; know that existing sessions are re-evaluated only when the session is marked dirty.</p>

<div class="eg"><p><b>Worked example.</b> Marketing needs HTTPS to one social site, 198.51.100.10, only from PC 10.0.1.20. You create SOCIAL_SITE (<code>subnet 198.51.100.10/32</code>) and MKT_PC (<code>subnet 10.0.1.20/32</code>). The service is the predefined HTTPS. The finished policy reads "MKT_PC to SOCIAL_SITE, HTTPS, accept". Next quarter the site moves to 198.51.100.20. You edit one object and the policy still works.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Naming objects with the address only (the name then lies after a change); using a /24 where a /32 was meant, which opens a whole subnet; deleting an object still in use (FortiOS refuses, and shows the reference); creating a service with the <i>source</i> port when you meant the destination port; putting FQDN objects in policies without a working DNS on the FortiGate, so they never resolve.</p></div>
<div class="exam"><p><b>Exam trap.</b> Predefined services use the <i>destination</i> port. A service object is "what the client connects to". Also know that address groups and service groups can be nested, but a group cannot contain itself, and that <code>all</code> is a built-in object you cannot delete.</p></div>

<div class="scn"><h4>One object, forty policies</h4><p>A firm moved its application servers from 10.5.0.0/24 to 10.7.0.0/24. In a firewall written with raw IPs the team would have edited forty policies and missed two. Here every policy used the group APP_SERVERS. One edit of the group and the change was complete, and the hit counters showed traffic flowing again the same minute.</p><p><b>Lesson:</b> objects are a change-management tool, not just a typing saver.</p></div>

<div class="iv"><p class="q">"Why do we use address and service objects instead of typing IPs and ports in policies?"</p><p>Reuse and safe change: one edit updates every policy that references the object. Objects make policies readable, groups let you express intent (WEB-SERVERS, ADMIN-PORTS), and the GUI and CLI show where an object is used. Mention FQDN and geography types and that predefined services already cover common protocols.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Address types include subnet, iprange, fqdn and geography; <code>all</code> and <code>none</code> are built in.</li>
<li>A service object matches a protocol and destination port; custom ones live in <code>config firewall service custom</code>.</li>
<li>Groups (<code>addrgrp</code>, <code>service group</code>) bundle objects and keep policies short.</li>
<li>Schedules (always, recurring, one-time) limit when a policy is active.</li>
<li>Use /32 for single hosts and meaningful names for every object.</li>
</ul></div>
`,hi:`
<p>Objects ko apne <b>phone ke contacts</b> ki tarah socho. Aap har baar 10.0.1.0/24 dial nahi karte; aap "LAN_NET" chunte ho. Subnet badle to ek contact edit karte ho aur use karne wali har policy saath badal jaati hai. Achhe objects policies ko chhota, readable aur badalne mein safe banate hain.</p>

<h3>Address objects</h3>
<p>Address object batata hai ki kaun ya kahan. FortiOS mein built-in object <code>all</code> (koi bhi address) aur <code>none</code> hote hain. Baaki sab aap <code>config firewall address</code> ke neeche banate ho. Common types:</p>
<table class="cmp"><tr><th>Type</th><th>Key setting</th><th>Use</th></tr>
<tr><td>subnet (default)</td><td><code>set subnet 10.0.1.0 255.255.255.0</code></td><td>ek LAN, ya ek host ke liye /32</td></tr>
<tr><td>iprange</td><td><code>set type iprange</code>, <code>start-ip</code>, <code>end-ip</code></td><td>DHCP scope, servers ka block</td></tr>
<tr><td>fqdn</td><td><code>set type fqdn</code>, <code>set fqdn social.example</code></td><td>FortiGate ke DNS se resolve hone wala naam</td></tr>
<tr><td>geography</td><td><code>set type geography</code>, <code>set country IN</code></td><td>country ke hisaab se block ya allow</td></tr>
<tr><td>wildcard-fqdn</td><td><code>set type wildcard-fqdn</code></td><td>domain ka koi bhi host (policy source ya destination)</td></tr></table>
<pre class="code">config firewall address
    edit "LAN_NET"
        set subnet 10.0.1.0 255.255.255.0
    next
    edit "DNS_GOOGLE"
        set type iprange
        set start-ip 8.8.8.8
        set end-ip 8.8.8.8
    next
end</pre>
<pre class="out">FGT1 # show firewall address
config firewall address
    edit "none"
        set subnet 0.0.0.0 255.255.255.255
    next
    edit "all"
    next
    edit "LAN_NET"
        set subnet 10.0.1.0 255.255.255.0
    next
    edit "DNS_GOOGLE"
        set type iprange
        set start-ip 8.8.8.8
        set end-ip 8.8.8.8
    next
end</pre>
<p>Built-in <code>all</code> aur <code>none</code> hamesha maujood rehte hain. Object ek <b>group</b> bhi ho sakta hai: <code>config firewall addrgrp</code> aur <code>set member</code>. Group mein addresses aur doosre groups ho sakte hain, isliye aap kai sites se "BLOCKED" bana sakte ho.</p>
<pre class="out">FGT1 # show firewall addrgrp
config firewall addrgrp
    edit "BLOCKED"
        set member "SOCIAL_SITE"
    next
end</pre>

<h3>Service objects</h3>
<p>Service object protocol aur <b>destination</b> port(s) batata hai. FortiOS mein dher saari predefined services (HTTP, HTTPS, DNS, PING, SSH, SMTP, RDP aur aur bhi) aati hain. Application kisi unusual port par chalti ho to <code>config firewall service custom</code> mein apni service banao.</p>
<pre class="code">config firewall service custom
    edit "TCP-8443"
        set tcp-portrange 8443
    next
end
config firewall service group
    edit "WEB-DNS-PING"
        set member HTTP HTTPS DNS PING
    end</pre>
<pre class="out">FGT1 # show firewall service group
config firewall service group
    edit "Email Access"
        set member "DNS" "IMAP" "IMAPS" "POP3" "POP3S" "SMTP" "SMTPS"
    next
    edit "Web Access"
        set member "DNS" "HTTP" "HTTPS"
    next
    edit "WEB-DNS-PING"
        set member "HTTP" "HTTPS" "DNS" "PING"
    next
end</pre>
<p>Dhyan do <code>PING</code> ICMP service hai (type 8, echo request), <code>HTTP</code> TCP 80 hai aur <code>HTTPS</code> TCP 443. Port range <code>tcp-portrange 8000-8100</code> bhi likh sakte ho. <code>ALL</code> ka matlab har protocol hai aur production allow rule mein yeh lagbhag kabhi sahi nahi hota.</p>

<div class="dia"><svg viewBox="0 0 640 170" role="img" aria-label="Objects feed a policy">
<rect x="10" y="15" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="40" text-anchor="middle" class="svg-ink" font-size="13">Address LAN_NET</text>
<rect x="10" y="65" width="170" height="40" rx="8" fill="#bbf7d0"/><text x="95" y="90" text-anchor="middle" class="svg-ink" font-size="13">Group BLOCKED</text>
<rect x="10" y="115" width="170" height="40" rx="8" fill="#fde68a"/><text x="95" y="140" text-anchor="middle" class="svg-ink" font-size="13">Service WEB-DNS-PING</text>
<rect x="250" y="30" width="170" height="100" rx="10" fill="#ddd6fe"/><text x="335" y="70" text-anchor="middle" class="svg-ink" font-size="14">Policy LAN-to-WAN</text><text x="335" y="92" text-anchor="middle" class="svg-muted" font-size="12">naam use karti hai, IP nahi</text>
<rect x="490" y="55" width="140" height="50" rx="10" fill="#bae6fd"/><text x="560" y="85" text-anchor="middle" class="svg-ink" font-size="13">Schedule always</text>
<line x1="180" y1="35" x2="250" y2="65" stroke="#64748b" stroke-width="2"/><line x1="180" y1="85" x2="250" y2="85" stroke="#64748b" stroke-width="2"/><line x1="180" y1="135" x2="250" y2="105" stroke="#64748b" stroke-width="2"/><line x1="490" y1="80" x2="420" y2="80" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Object ek baar edit karo aur use karne wali har policy saath badal jaati hai.</p></div>

<h3>Schedules</h3>
<p>Schedule limit karta hai ki policy kab active hai. Built-in <code>always</code> default hai. <b>Recurring</b> schedule chune hue weekdays aur times par repeat hota hai (<code>config firewall schedule recurring</code>), <b>one-time</b> schedule do dates ke beech chalta hai (<code>config firewall schedule onetime</code>), aur schedule groups inhe milate hain. Schedule commands simulator mein available nahi hain, isliye yeh reference configuration hai (not run in the simulator):</p>
<pre class="code"><span class="c">! Reference configuration (not run in the simulator)</span>
config firewall schedule recurring
    edit "OFFICE-HOURS"
        set day monday tuesday wednesday thursday friday
        set start 09:00
        set end 18:00
    next
end</pre>
<p>OFFICE-HOURS use karne wali policy sirf us window ke andar match karti hai. Bahar woh skip hoti hai aur agli try hoti hai. Jo sessions pehle se maujood hain unhe default mein 18:00 par todta nahi, kyunki policy naye sessions ke liye check hoti hai; yaad rakho ki existing sessions tabhi dobara evaluate hote hain jab session dirty mark ho.</p>

<div class="eg"><p><b>Worked example.</b> Marketing ko ek social site 198.51.100.10 par sirf PC 10.0.1.20 se HTTPS chahiye. Aap SOCIAL_SITE (<code>subnet 198.51.100.10/32</code>) aur MKT_PC (<code>subnet 10.0.1.20/32</code>) banate ho. Service predefined HTTPS hai. Final policy padhti hai "MKT_PC to SOCIAL_SITE, HTTPS, accept". Agli quarter site 198.51.100.20 par chali jaati hai. Aap ek object edit karte ho aur policy chalti rehti hai.</p></div>

<div class="warn"><p><b>Common beginner mistakes.</b> Objects ka naam sirf address se rakhna (badalne ke baad naam jhooth bolta hai); /32 ki jagah /24 lagana jisse poora subnet khul jaata hai; use mein chal rahe object ko delete karna (FortiOS mana karta hai aur reference dikhata hai); jahan destination port chahiye wahan <i>source</i> port wali service banana; FortiGate par DNS kaam na kare to FQDN objects policy mein lagana, jo kabhi resolve nahi hote.</p></div>
<div class="exam"><p><b>Exam trap.</b> Predefined services <i>destination</i> port use karti hain. Service object "client kis se connect karta hai" hai. Yeh bhi jaano ki address groups aur service groups nest ho sakte hain, lekin group khud ko contain nahi kar sakta, aur <code>all</code> built-in object hai jise delete nahi kar sakte.</p></div>

<div class="scn"><h4>Ek object, chalis policies</h4><p>Ek firm ne application servers ko 10.5.0.0/24 se 10.7.0.0/24 par move kiya. Raw IPs wale firewall mein team chalis policies edit karti aur do chhoot jaati. Yahan har policy group APP_SERVERS use karti thi. Group ek baar edit hua aur change poora ho gaya, aur hit counters ne usi minute traffic dobara chalta dikhaya.</p><p><b>Lesson:</b> objects sirf typing bachane ke liye nahi, change-management ka tool hain.</p></div>

<div class="iv"><p class="q">"Policies mein IPs aur ports type karne ki jagah address aur service objects kyun use karte hain?"</p><p>Reuse aur safe change: ek edit se us object ko use karne wali har policy update ho jaati hai. Objects policies ko readable banate hain, groups intent express karte hain (WEB-SERVERS, ADMIN-PORTS), aur GUI aur CLI dikhate hain ki object kahan use hua hai. FQDN aur geography types ka zikr karo aur yeh ki predefined services common protocols pehle se cover karti hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Address types mein subnet, iprange, fqdn aur geography hain; <code>all</code> aur <code>none</code> built-in hain.</li>
<li>Service object protocol aur destination port match karta hai; custom wali <code>config firewall service custom</code> mein hoti hain.</li>
<li>Groups (<code>addrgrp</code>, <code>service group</code>) objects ko bundle karte hain aur policies chhoti rakhte hain.</li>
<li>Schedules (always, recurring, one-time) policy ke active hone ka time limit karte hain.</li>
<li>Single hosts ke liye /32 aur har object ke liye meaningful naam use karo.</li>
</ul></div>
`}};export{e as default};