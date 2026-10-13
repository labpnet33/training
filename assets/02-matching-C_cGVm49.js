var e=(e,t,n,r,i,a,o)=>`<rect x="`+e+`" y="`+t+`" width="`+n+`" height="`+r+`" rx="8" fill="`+i+`"/><text x="`+(e+n/2)+`" y="`+(t+r/2+(o?-2:4))+`" text-anchor="middle" class="svg-ink" font-size="12">`+a+`</text>`+(o?`<text x="`+(e+n/2)+`" y="`+(t+r/2+13)+`" text-anchor="middle" class="svg-muted" font-size="11">`+o+`</text>`:``),t=(e,t,n,r)=>`<line x1="`+e+`" y1="`+t+`" x2="`+n+`" y2="`+r+`" stroke="#64748b" stroke-width="2"/>`,n=(e,t,n)=>`<div class="dia"><svg viewBox="0 0 640 `+e+`" role="img" aria-label="diagram">`+t+`</svg><p class="cap">`+n+`</p></div>`,r=r=>n(210,e(10,70,110,60,`#bae6fd`,r[0],r[1])+e(160,20,140,44,`#bbf7d0`,r[2],r[3])+e(160,80,140,44,`#bbf7d0`,r[4],r[5])+e(160,140,140,44,`#bbf7d0`,r[6],r[7])+e(340,80,140,44,`#fed7aa`,r[8],r[9])+e(510,70,120,60,`#ddd6fe`,r[10],r[11])+t(120,100,160,42)+t(120,100,160,102)+t(120,100,160,162)+t(300,42,340,102)+t(300,102,340,102)+t(300,162,340,102)+t(480,102,510,100),r[12]),i={id:`matching`,h:{en:`Matching traffic: source, destination, ISDB, applications, users`,hi:`Traffic match karna: source, destination, ISDB, applications, users`},body:{en:`
<p>A rule has two halves. The <b>match</b> half answers "which sessions are mine?". The <b>strategy</b> half answers "which member do they use?". This chapter covers the match half. All criteria you fill in are combined with <b>AND</b>: a session must satisfy every one. A criterion you leave empty means "any".</p>
<h3>The criteria</h3>
<table class="cmp"><tr><th>Criterion</th><th>What it matches</th><th>Typical use</th></tr>
<tr><td>Source address (and user or group)</td><td>Client subnet or authenticated identity</td><td>Executives get a better path than guests</td></tr>
<tr><td>Destination address</td><td>Server subnet or FQDN object</td><td>Private data centre prefix, a partner network</td></tr>
<tr><td>Internet service (ISDB)</td><td>Fortinet-maintained list of IP, port and protocol tuples for a named service, such as an Office 365 or a video-meeting provider</td><td>SaaS steering without keeping IP lists</td></tr>
<tr><td>Application (app-ctrl signature)</td><td>Application recognised by deep inspection of the traffic</td><td>Steer by application name, even on shared ports</td></tr>
<tr><td>Protocol and port range</td><td>Layer 4 protocol and ports</td><td>SIP, RTP ranges, a custom TCP service</td></tr>
<tr><td>TOS / DSCP</td><td>The ToS byte value with a mask</td><td>Trust markings from voice phones</td></tr>
<tr><td>Incoming interface</td><td>Where the traffic enters</td><td>Different behaviour per LAN or VLAN</td></tr></table>
<p>Negation exists for source and destination (match everything except the object). Use it with care: a negated address in the first rule can swallow nearly all traffic.</p>
<div class="warn"><p><b>Common mistake.</b> Filling both a destination address and an Internet Service in one rule and expecting OR. The criteria are ANDed, so a session must fit both and usually nothing matches. For two alternatives, write two rules, or put both in one address group when they are the same kind of object.</p></div>
<h3>Why ISDB beats hand-written IP lists</h3>
<p>SaaS providers change addresses often. The Internet Service Database is a signed package delivered to the FortiGate by FortiGuard and updated regularly, so a rule that says "Microsoft Office 365" keeps working when Microsoft adds a range. If FortiGuard updates stop, the list ages; that is a monitoring item in chapter 8. Chapter 5 goes deep on ISDB, custom internet services and application control.</p>
`+r([`Session`,`src, dst, port, app`,`Source / user`,`AND`,`Destination / ISDB`,`AND`,`Protocol / port / TOS`,`AND`,`All criteria true`,`rule is a match`,`Strategy`,`pick a member`,`Every filled criterion must match; empty means any.`])+`
<h3>Reference configuration</h3>
<pre class="code"># Try it: lab "Best quality for voice, a pinned link for backups"
config system sdwan
    config service
        edit 1
            set name "Voice-to-HQ"
            set mode priority
            set dst "HQ-VOIP-NET"
            set protocol 17
            set start-port 10000
            set end-port 20000
            set tos 0xb8
            set tos-mask 0xfc
            set health-check "HQ-Loopback"
            set priority-members 1 2
        next
    end
end</pre>
<p>The names above are examples, and the addresses behind <code>HQ-VOIP-NET</code> would be documentation ranges such as 198.51.100.0/24. Option names for the port range and ToS exist in the service context on the builds I checked, but confirm them with <code>set ?</code> on your firmware. <code>priority-members</code> lists member sequence numbers, which chapter 3 explains.</p>
<div class="exam"><p><b>Exam trap.</b> If a question says a rule "never matches", first check the AND logic and the order, then check whether the traffic is really what you think: an application signature will not match until the first packets have been classified (chapter 5), and a ToS match fails if an upstream device re-marks the byte.</p></div>
<div class="scn"><h4>The hidden AND</h4><p>A branch rule had destination "Office365-nets" and an application signature for a video-meeting tool. Nothing matched. The engineer expected OR. Splitting it into two rules, one per criterion, fixed it, and the hit counters showed which traffic each caught.</p><p><b>Lesson:</b> AND inside a rule, OR across rules.</p></div>
<div class="iv"><p class="q">"How are multiple criteria in one SD-WAN rule combined?"</p><p>With AND. Every populated field must match; unpopulated fields are wildcards. For alternatives write separate rules, remembering that order decides which one is reached first.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Match criteria are ANDed; empty means any.</li><li>Source, user, destination, ISDB, application, protocol and port, ToS and input interface are available.</li><li>ISDB is the low-maintenance way to name SaaS; it needs working FortiGuard updates.</li><li>Rules never create permission; the policy still decides.</li></ul></div>
`,hi:`
<p>Rule ke do hisse hote hain. <b>Match</b> hissa jawab deta hai "kaun se sessions mere hain?". <b>Strategy</b> hissa jawab deta hai "woh kaun sa member use karein?". Yeh chapter match hisse ko cover karta hai. Jo bhi criteria aap bharte ho woh <b>AND</b> se jud jaate hain: session ko har ek poora karna hoga. Khaali criterion ka matlab "any".</p>
<h3>Criteria</h3>
<table class="cmp"><tr><th>Criterion</th><th>Kya match karta hai</th><th>Aam use</th></tr>
<tr><td>Source address (aur user ya group)</td><td>Client subnet ya authenticated identity</td><td>Executives ko guests se behtar path</td></tr>
<tr><td>Destination address</td><td>Server subnet ya FQDN object</td><td>Private data centre prefix, partner network</td></tr>
<tr><td>Internet service (ISDB)</td><td>Fortinet ki maintained list jisme kisi named service ke IP, port aur protocol hote hain, jaise Office 365 ya video-meeting provider</td><td>IP list maintain kiye bina SaaS steering</td></tr>
<tr><td>Application (app-ctrl signature)</td><td>Traffic ki deep inspection se pehchani gayi application</td><td>Shared ports par bhi application naam se steer</td></tr>
<tr><td>Protocol aur port range</td><td>Layer 4 protocol aur ports</td><td>SIP, RTP ranges, custom TCP service</td></tr>
<tr><td>TOS / DSCP</td><td>ToS byte value mask ke saath</td><td>Voice phones ki markings par bharosa</td></tr>
<tr><td>Incoming interface</td><td>Traffic kahan se andar aata hai</td><td>Har LAN ya VLAN ke liye alag behaviour</td></tr></table>
<p>Source aur destination ke liye negation hota hai (object ke alawa sab kuch match). Dhyan se use karo: pehle rule mein negated address lagbhag saara traffic nigal sakta hai.</p>
<div class="warn"><p><b>Common galti.</b> Ek hi rule mein destination address aur Internet Service dono bharna aur OR ki ummeed karna. Criteria AND hote hain, isliye session dono mein fit hona chahiye aur aksar kuch match nahi hota. Do alternatives ke liye do rules likho, ya agar dono ek hi type ke object hain to ek address group mein daalo.</p></div>
<h3>ISDB haath se likhi IP lists se behtar kyun</h3>
<p>SaaS providers aksar addresses badalte hain. Internet Service Database ek signed package hai jo FortiGuard FortiGate ko deta hai aur regularly update karta hai, isliye "Microsoft Office 365" wala rule tab bhi chalta hai jab Microsoft nayi range jodta hai. Agar FortiGuard updates ruk jaayein to list purani ho jaati hai; yeh chapter 8 mein monitoring item hai. Chapter 5 ISDB, custom internet services aur application control mein gehraai se jaata hai.</p>
`+r([`Session`,`src, dst, port, app`,`Source / user`,`AND`,`Destination / ISDB`,`AND`,`Protocol / port / TOS`,`AND`,`Saare criteria sahi`,`rule match hua`,`Strategy`,`member chuno`,`Bhara hua har criterion match ho; khaali ka matlab any.`])+`
<h3>Reference configuration</h3>
<pre class="code"># Try it: lab "Voice ke liye best quality, backups ke liye pinned link"
config system sdwan
    config service
        edit 1
            set name "Voice-to-HQ"
            set mode priority
            set dst "HQ-VOIP-NET"
            set protocol 17
            set start-port 10000
            set end-port 20000
            set tos 0xb8
            set tos-mask 0xfc
            set health-check "HQ-Loopback"
            set priority-members 1 2
        next
    end
end</pre>
<p>Upar ke naam examples hain, aur <code>HQ-VOIP-NET</code> ke peeche ke addresses 198.51.100.0/24 jaisi documentation ranges honge. Port range aur ToS ke option names un builds par service context mein the jo maine dekhe, lekin apne firmware par <code>set ?</code> se confirm karo. <code>priority-members</code> member sequence numbers ki list hai, jo chapter 3 samjhata hai.</p>
<div class="exam"><p><b>Exam trap.</b> Agar sawal kahe ki rule "kabhi match nahi karta", pehle AND logic aur order check karo, phir dekho ki traffic sach mein wahi hai jo aap sochte ho: application signature tab tak match nahi karega jab tak pehle packets classify na ho jaayein (chapter 5), aur ToS match fail hoga agar upstream device byte ko re-mark kar de.</p></div>
<div class="scn"><h4>Chhupa hua AND</h4><p>Ek branch rule mein destination "Office365-nets" aur ek video-meeting tool ka application signature tha. Kuch match nahi hua. Engineer ne OR socha tha. Ise do rules mein todna, har criterion ke liye ek, theek kar gaya, aur hit counters ne dikhaya ki har ek ne kaun sa traffic pakda.</p><p><b>Seekh:</b> Rule ke andar AND, rules ke beech OR.</p></div>
<div class="iv"><p class="q">"Ek SD-WAN rule ke multiple criteria kaise combine hote hain?"</p><p>AND se. Har bhara hua field match hona chahiye; khaali fields wildcard hain. Alternatives ke liye alag rules likho, yaad rakhte hue ki order tay karta hai kaun sa pehle reach hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Match criteria AND hote hain; khaali ka matlab any.</li><li>Source, user, destination, ISDB, application, protocol aur port, ToS aur input interface available hain.</li><li>ISDB SaaS ko naam dene ka kam-maintenance tareeka hai; ise working FortiGuard updates chahiye.</li><li>Rules kabhi permission nahi banate; policy hi tay karti hai.</li></ul></div>
`}};export{i as default};