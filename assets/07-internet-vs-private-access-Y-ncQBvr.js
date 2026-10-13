var e={id:`internet-vs-private-access`,h:{en:`Internet access versus private application access`,hi:`Internet access versus private application access`},body:{en:`
<p>Picture a hotel guest with two errands: buy a coffee outside, and visit a colleague in the staff-only office on the fourth floor. The front desk treats them very differently. The coffee trip needs only a quick check. The staff office needs a key card and a record in the visitor book. In Prisma Access the two errands are <b>internet access</b> (SaaS and public sites) and <b>private application access</b> (apps in your data centre). The only thing that separates them for policy is the destination zone you set up in chapter 2.</p>

<h3>Two kinds of destination</h3>
<table class="cmp">
<tr><th></th><th>Internet and SaaS</th><th>Private application</th></tr>
<tr><td>Destination zone</td><td>Untrust</td><td>Trust (after mapping the data-centre zone)</td></tr>
<tr><td>How it is reached</td><td>Prisma Access sends it to the internet</td><td>Over a service connection (IPsec) to HQ</td></tr>
<tr><td>Typical rule focus</td><td>URL filtering, threat prevention, application control</td><td>Specific servers, users and groups, HIP</td></tr>
<tr><td>Default stance</td><td>Allow common business applications with full profiles</td><td>Deny by default, allow named servers only</td></tr>
</table>
<p>The documentation says exactly this: destination zones mapped as untrust are for the internet and SaaS, and zones mapped as trust are for corporate and data-centre resources.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two destinations">
<rect x="15" y="85" width="130" height="60" rx="8" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.200.0.7</text>
<rect x="215" y="75" width="150" height="80" rx="8" fill="#ddd6fe"/><text x="290" y="108" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="290" y="128" text-anchor="middle" class="svg-muted" font-size="12">policy decides</text>
<rect x="450" y="15" width="170" height="60" rx="8" fill="#fed7aa"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Internet / SaaS</text><text x="535" y="60" text-anchor="middle" class="svg-muted" font-size="12">zone: untrust</text>
<rect x="450" y="150" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="177" text-anchor="middle" class="svg-ink" font-size="13">HQ app 10.10.0.50</text><text x="535" y="195" text-anchor="middle" class="svg-muted" font-size="12">zone: trust, via service conn.</text>
<line x1="145" y1="115" x2="215" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="365" y1="95" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><line x1="365" y1="135" x2="450" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">One entrance, two exits. The destination zone selects the rule and the path.</p></div>

<h3>Private application rule</h3>
<p>For the lab, the private application is the HQ server 10.10.0.50 behind HQ-FW (LAN 10.10.0.1/24). Prisma Access reaches it over the service connection (HQ-FW WAN 192.0.2.10, tenant endpoint 203.0.113.102). A good private rule is narrow: source is a user group or the mobile pool, destination is one named address, application is named, profile group is attached, and the log is forwarded.</p>
<pre class="code"><span class="c"># Private app rule (teaching format)</span>
Name:               allow-private-hq-app
Source zone:        mobile users zone
Source user:        group app-users
Destination zone:   trust
Destination addr:   hq-app (10.10.0.50)
Application:        ssl, web-browsing
Service:            application-default
Action:             allow    Profile group: corp-standard
Log:                at session end, forward via corp-logs</pre>

<h3>Internet rule</h3>
<pre class="code"><span class="c"># Internet rule (teaching format)</span>
Name:               allow-internet-web
Source zone:        mobile users zone
Destination zone:   untrust
Application:        web-browsing, ssl, and named SaaS applications
Service:            application-default
Action:             allow    Profile group: corp-standard (URL filtering inside)
Log:                at session end</pre>
<p>The same profile group is used in both rules, which is the point of profile groups. The difference is that the internet rule relies heavily on URL filtering, and the private rule relies on tight destination and identity matching.</p>

<h3>The two outcomes in the log</h3>
<pre class="out">Time      Src IP        Dst IP        Dst Zone  App          Rule                  Action
14:01:11  10.200.0.7    10.10.0.50    trust     ssl          allow-private-hq-app  allow
14:01:19  10.200.0.7    198.51.100.77 untrust   web-browsing <span class="hl">allow-internet-web</span>     allow
14:01:44  10.200.0.7    10.10.0.99    trust     ssl          <span class="hl">deny-other-internal</span>   deny</pre>

<h3>Return path and branches</h3>
<p>For the private application the reply must get back. The data-centre side needs a route back to the mobile user pool (10.200.0.0/23), the remote network subnets (for example 10.20.0.0/24) and the infrastructure subnet (10.255.0.0/24) through the service connection peer. Policy can say "allow", but without a return route the session never completes (that is the fault in the service connections module). Branches follow the same split: remote network users reach the internet through Prisma Access and reach HQ over the service connection. Mobile users reach remote networks through a service connection, as a hub and spoke.</p>

<div class="eg"><p><b>Worked example.</b> A branch PC (10.20.0.100) opens <code>news.example</code>: destination zone untrust, rule allow-internet-web, URL profile applies. The same PC opens the HQ app 10.10.0.50: destination zone trust, rule allow-private-hq-app, source zone is the branch zone. If the second rule only names the mobile users' zone as source, the branch PC does not match it. The rule must list both source populations, or you create a second rule for the branch.</p></div>

<div class="warn"><p><b>Common mistakes.</b> One giant "allow all" for both destinations; forgetting that a rule with the mobile users' source zone does not cover branches; using an internet profile group with a tight private rule but no logs on the private rule; assuming policy "allow" proves the app works.</p></div>
<div class="exam"><p><b>Exam trap.</b> Internet and SaaS destinations map to untrust; corporate and data-centre destinations map to trust. The question may describe a data-centre zone left untrust; the fix is the zone mapping, not a wider rule. Also, internet egress over service connections is not supported, which is why internet traffic goes out from Prisma Access and not through HQ.</p></div>

<div class="scn"><h4>Branch reached the web but not the app</h4><p>Branch PC-BR could browse but could not open the HQ app. The traffic log showed source zone as the branch zone and the final rule as deny-other-internal. The private allow rule listed only the mobile users' zone as source. The team added the branch zone as an additional source in a reviewed change and pushed it.</p><p><b>Lesson:</b> when the web works and the private app does not, compare source zones and destination zones in the log with the rule fields.</p></div>

<div class="iv"><p class="q">"How does Prisma Access treat internet and private application traffic differently?"</p><p>Policy sees them as different destination zones: untrust for internet and SaaS, trust for data-centre resources. Internet rules lean on App-ID and URL filtering; private rules lean on named servers, users, groups and HIP. Private traffic travels over service connections and needs a return route at HQ.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Untrust = internet and SaaS; trust = corporate and data centre (after you map it).</li>
<li>Private rules are narrow: named servers, users and applications.</li>
<li>Source zone matters: a mobile-user rule does not automatically cover branches.</li>
<li>Policy allow still needs a return route at HQ for private apps.</li>
<li>Use the same profile group across both rule types.</li>
</ul></div>
`,hi:`
<p>Ek hotel guest socho jiske do kaam hain: bahar coffee kharidna, aur chauthi manzil par staff-only office mein ek colleague se milna. Front desk dono ke saath alag tarah se pesh aata hai. Coffee trip ke liye bas ek quick check. Staff office ke liye key card aur visitor book mein entry. Prisma Access mein ye do kaam hain <b>internet access</b> (SaaS aur public sites) aur <b>private application access</b> (aapke data centre ke apps). Policy ke liye inhe alag karne wali cheez wahi destination zone hai jo aapne chapter 2 mein set ki.</p>

<h3>Do tarah ki destination</h3>
<table class="cmp">
<tr><th></th><th>Internet aur SaaS</th><th>Private application</th></tr>
<tr><td>Destination zone</td><td>Untrust</td><td>Trust (data-centre zone map karne ke baad)</td></tr>
<tr><td>Kaise reach hota hai</td><td>Prisma Access ise internet bhejta hai</td><td>HQ tak service connection (IPsec) se</td></tr>
<tr><td>Typical rule focus</td><td>URL filtering, threat prevention, application control</td><td>Specific servers, users aur groups, HIP</td></tr>
<tr><td>Default stance</td><td>Common business applications ko full profiles ke saath allow</td><td>Default deny, sirf named servers allow</td></tr>
</table>
<p>Documentation yahi kehti hai: untrust map hue destination zones internet aur SaaS ke liye hain, aur trust map hue zones corporate aur data-centre resources ke liye.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="Two destinations">
<rect x="15" y="85" width="130" height="60" rx="8" fill="#bae6fd"/><text x="80" y="112" text-anchor="middle" class="svg-ink" font-size="13">Laptop</text><text x="80" y="130" text-anchor="middle" class="svg-muted" font-size="12">10.200.0.7</text>
<rect x="215" y="75" width="150" height="80" rx="8" fill="#ddd6fe"/><text x="290" y="108" text-anchor="middle" class="svg-ink" font-size="13">Prisma Access</text><text x="290" y="128" text-anchor="middle" class="svg-muted" font-size="12">policy decide karti hai</text>
<rect x="450" y="15" width="170" height="60" rx="8" fill="#fed7aa"/><text x="535" y="42" text-anchor="middle" class="svg-ink" font-size="13">Internet / SaaS</text><text x="535" y="60" text-anchor="middle" class="svg-muted" font-size="12">zone: untrust</text>
<rect x="450" y="150" width="170" height="60" rx="8" fill="#bbf7d0"/><text x="535" y="177" text-anchor="middle" class="svg-ink" font-size="13">HQ app 10.10.0.50</text><text x="535" y="195" text-anchor="middle" class="svg-muted" font-size="12">zone: trust, service conn. se</text>
<line x1="145" y1="115" x2="215" y2="115" stroke="#64748b" stroke-width="2"/>
<line x1="365" y1="95" x2="450" y2="45" stroke="#64748b" stroke-width="2"/><line x1="365" y1="135" x2="450" y2="180" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">Ek entrance, do exits. Destination zone rule aur path select karti hai.</p></div>

<h3>Private application rule</h3>
<p>Lab mein private application HQ server 10.10.0.50 hai, HQ-FW (LAN 10.10.0.1/24) ke peeche. Prisma Access use service connection se reach karta hai (HQ-FW WAN 192.0.2.10, tenant endpoint 203.0.113.102). Achha private rule narrow hota hai: source user group ya mobile pool, destination ek named address, application named, profile group attached, aur log forwarded.</p>
<pre class="code"><span class="c"># Private app rule (teaching format)</span>
Name:               allow-private-hq-app
Source zone:        mobile users zone
Source user:        group app-users
Destination zone:   trust
Destination addr:   hq-app (10.10.0.50)
Application:        ssl, web-browsing
Service:            application-default
Action:             allow    Profile group: corp-standard
Log:                at session end, forward via corp-logs</pre>

<h3>Internet rule</h3>
<pre class="code"><span class="c"># Internet rule (teaching format)</span>
Name:               allow-internet-web
Source zone:        mobile users zone
Destination zone:   untrust
Application:        web-browsing, ssl, and named SaaS applications
Service:            application-default
Action:             allow    Profile group: corp-standard (URL filtering inside)
Log:                at session end</pre>
<p>Dono rules mein same profile group use hota hai, yahi profile groups ka point hai. Fark ye hai ki internet rule URL filtering par zyada nirbhar hai, aur private rule tight destination aur identity matching par.</p>

<h3>Log mein dono outcomes</h3>
<pre class="out">Time      Src IP        Dst IP        Dst Zone  App          Rule                  Action
14:01:11  10.200.0.7    10.10.0.50    trust     ssl          allow-private-hq-app  allow
14:01:19  10.200.0.7    198.51.100.77 untrust   web-browsing <span class="hl">allow-internet-web</span>     allow
14:01:44  10.200.0.7    10.10.0.99    trust     ssl          <span class="hl">deny-other-internal</span>   deny</pre>

<h3>Return path aur branches</h3>
<p>Private application ke liye reply ka wapas aana zaroori hai. Data-centre side ko service connection peer ke through mobile user pool (10.200.0.0/23), remote network subnets (jaise 10.20.0.0/24) aur infrastructure subnet (10.255.0.0/24) ka return route chahiye. Policy "allow" keh sakti hai, lekin return route ke bina session kabhi complete nahi hota (yahi service connections module ka fault hai). Branches par bhi yahi split lagta hai: remote network users Prisma Access se internet jaate hain aur HQ service connection se. Mobile users remote networks tak service connection se hub and spoke ki tarah pahunchte hain.</p>

<div class="eg"><p><b>Worked example.</b> Branch PC (10.20.0.100) <code>news.example</code> kholta hai: destination zone untrust, rule allow-internet-web, URL profile lagta hai. Wahi PC HQ app 10.10.0.50 kholta hai: destination zone trust, rule allow-private-hq-app, source zone branch zone hai. Agar doosra rule sirf mobile users ke zone ko source maanta hai, to branch PC match nahi karta. Rule mein dono source populations likhni padengi, ya branch ke liye doosra rule banao.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Dono destinations ke liye ek bada "allow all"; ye bhool jana ki mobile users ke source zone wala rule branches ko cover nahi karta; private rule tight rakhna lekin us par logs na lagana; policy "allow" ko app chalne ka proof maan lena.</p></div>
<div class="exam"><p><b>Exam trap.</b> Internet aur SaaS destinations untrust se map hoti hain; corporate aur data-centre destinations trust se. Question data-centre zone ko untrust chhoda hua bata sakta hai; fix zone mapping hai, wider rule nahi. Ye bhi: service connections par internet egress supported nahi hai, isliye internet traffic Prisma Access se nikalta hai, HQ ke through nahi.</p></div>

<div class="scn"><h4>Branch web tak pahunchi, app tak nahi</h4><p>Branch PC-BR browse kar paa raha tha lekin HQ app nahi khol paa raha tha. Traffic log mein source zone branch zone aur final rule deny-other-internal tha. Private allow rule ne sirf mobile users ke zone ko source likha tha. Team ne reviewed change mein branch zone ko additional source ke roop mein jodkar push kar diya.</p><p><b>Lesson:</b> web chal rahi ho aur private app nahi, to log ke source zones aur destination zones ko rule fields se compare karo.</p></div>

<div class="iv"><p class="q">"Prisma Access internet aur private application traffic ko alag kaise treat karta hai?"</p><p>Policy ko wo alag destination zones dikhte hain: internet aur SaaS ke liye untrust, data-centre resources ke liye trust. Internet rules App-ID aur URL filtering par jhukte hain; private rules named servers, users, groups aur HIP par. Private traffic service connections par chalta hai aur HQ par return route chahiye.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Untrust = internet aur SaaS; trust = corporate aur data centre (aapke map karne ke baad).</li>
<li>Private rules narrow hote hain: named servers, users aur applications.</li>
<li>Source zone matter karta hai: mobile-user rule branches ko apne aap cover nahi karta.</li>
<li>Private apps ke liye policy allow ke baad bhi HQ par return route chahiye.</li>
<li>Dono rule types mein same profile group use karo.</li>
</ul></div>
`}};export{e as default};