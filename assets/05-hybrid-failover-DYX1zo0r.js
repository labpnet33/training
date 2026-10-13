var e={id:`hybrid-failover`,h:{en:`Designing hybrid DIA: per-application breakout, trackers and failover`,hi:`Hybrid DIA design: per-application breakout, trackers aur failover`},body:{en:`
<p>You now know the two ways to steer traffic to a local exit. The real engineering question is <b>which traffic to break out, and what happens when the local exit fails</b>. This chapter gives you design patterns, an application-based DIA policy, and the safety net: the NAT DIA tracker and fallback.</p>

<h3>Analogy: a building with a main gate and a side gate</h3>
<p>Visitors normally use the main gate, where security checks them. Delivery vans use the side gate to save time. If the side gate is blocked by a broken-down truck, the guard must send vans to the main gate instead of letting them wait forever. DIA is the side gate; the data center is the main gate; the <b>tracker</b> is the guard who notices the blocked side gate.</p>

<h3>Design patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Tool</th><th>Good for</th></tr>
<tr><td><b>Full local breakout</b> for a VPN</td><td>NAT DIA route</td><td>Small shops, kiosks, all traffic is internet</td></tr>
<tr><td><b>Source-based</b> breakout</td><td>Data policy matching a source prefix</td><td>Guest Wi-Fi, IoT, contractors</td></tr>
<tr><td><b>Application-based</b> breakout</td><td>Data policy matching an app-list</td><td>Trusted SaaS (Microsoft 365, Webex), video</td></tr>
<tr><td><b>Everything backhauled</b>, DIA only to the cloud security provider</td><td>Route or policy to a SIG tunnel</td><td>Strict inspection without a branch security stack</td></tr>
<tr><td><b>Best exit per application, chosen by measurement</b></td><td>Cloud OnRamp for SaaS</td><td>Many SaaS apps, branches with several exits</td></tr></table>

<h3>Application-based DIA</h3>
<p>Instead of a source subnet, match the <b>application</b>. Security approves a list of trusted SaaS applications; only those break out locally.</p>
<pre class="code"><span class="c">! VSMART: only approved SaaS breaks out, everything else follows routing</span>
policy
 lists
  app-list TRUSTED-SAAS
   app ms-office-365
   app webex-meeting
 data-policy APP-DIA
  vpn-list CORP
   sequence 10
    match
     app-list TRUSTED-SAAS
    action accept
     nat use-vpn 0 fallback
     count saas-dia
   default-action accept
apply-policy
 site-list PUNE
  data-policy APP-DIA from-service</pre>
<p>Remember from the previous module that the edge needs a few packets (or a DNS clue through <code>dns-app-list</code>) to recognise an application, so the very first packets of a new flow may still follow the routing table. For a hard requirement that a specific SaaS must always leave locally, add the SaaS prefixes or domains to the match as well.</p>

<h3>The safety net: NAT DIA tracker and fallback</h3>
<p>The NAT DIA route stays installed as long as the transport interface is up and NAT-enabled, <b>even when the ISP behind it is dead</b>. Users then lose internet while a perfectly good backhaul path through the data center sits unused. A <b>tracker</b> fixes this: the edge probes an internet target through the transport, and when the probe fails it treats the DIA exit as unavailable. Then:</p>
<ul>
<li>With the <b>route</b> method, the NAT DIA route is withdrawn and traffic falls back to the OMP default (backhaul).</li>
<li>With the <b>policy</b> method, the <code>fallback</code> keyword makes matching traffic continue with a normal routing lookup.</li>
</ul>
<pre class="code"><span class="c">! E-BR1: the tracker, attached to the NAT transport</span>
endpoint-tracker tracker1
 tracker-type interface
 endpoint-dns-name www.bharat.example
 threshold 300
 interval 30
 multiplier 3
!
interface GigabitEthernet1
 ip nat outside
 endpoint-tracker tracker1</pre>
<p>The threshold (100 to 1000 ms) is how long the edge waits for the probe response, the interval (20 to 600 s) is how often it probes, and the multiplier (1 to 10) is how many failed probes are tolerated. In Manager, the tracker is defined in the System feature template (or system profile) and attached to the NAT transport interface under its advanced options. Newer releases also let trackers consider jitter and loss, not only reachability.</p>
<pre class="out">E-BR1# show endpoint-tracker
Interface          Record Name  Status  RTT in msec  Probe ID  Next Hop
GigabitEthernet1   tracker1     <span class="hl">Up</span>      8            4         203.0.113.9

E-BR1# show endpoint-tracker records
Record Name  Endpoint                  EndPoint Type  Threshold  Multiplier  Interval
tracker1     www.bharat.example        DNS_NAME       300        3           30</pre>

<div class="eg"><p><b>Worked example.</b> Pune's internet circuit fails upstream at 14:10; the interface stays up because the modem still has link. Without a tracker, the NAT DIA route remains and every user loses internet for hours. With the tracker above, three probes in a row fail (about 90 seconds), the status becomes Down, the n*Nd route is withdrawn, and users flow through the OMP default to Mumbai. When the ISP recovers, the tracker goes Up and the NAT route returns. <b>Remember:</b> this only works if the data center still advertises a default route as the backup path.</p></div>

<h3>Other design details</h3>
<ul>
<li><b>Keep the DC default.</b> E-DC must keep advertising the internet default (in our lab, <code>advertise static</code> of the DC-FW default) so that backhaul exists as the fallback. If you retire it, a failed local exit has nowhere to go.</li>
<li><b>Which transports get NAT.</b> NAT only on internet colors (biz-internet, broadband, LTE as backup). Never on a private MPLS transport.</li>
<li><b>Several NAT transports.</b> With more than one internet transport, expect DIA traffic to be shared among them by routing. Verify with the service-path tool rather than assuming, and use Cloud OnRamp for SaaS when you need a per-application best exit.</li>
<li><b>DIA traffic does not use tunnels.</b> It is not subject to application-aware routing, SLA classes or IPsec: it leaves in clear (with TLS from the application) toward the internet. That is why security at the branch matters (next chapter).</li>
<li><b>Return traffic.</b> Replies come back to the translated address on the same interface, so no asymmetric routing issue arises, unlike backhaul through another NAT.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Enabling DIA without a tracker and without a backhaul fallback. (2) Probing a target that is itself blocked by the firewall policy, causing false "down" states. (3) Matching "all internet" for a compliance-restricted app, so it leaves locally. (4) Removing the DC default route after DIA goes live, which removes the fallback.</p></div>

<div class="exam"><p><b>Exam trap.</b> A <b>tracker</b> detects a failing ISP when the interface is still up; <code>fallback</code> in the data policy decides what happens to the matched traffic when the DIA exit is unavailable. They work together; neither replaces the other. DIA traffic does not ride the SD-WAN tunnels, so BFD cannot detect an internet outage for it.</p></div>

<div class="scn"><h4>Local internet down, branch silent</h4><p>A Bharat Retail kiosk lost its broadband upstream on a Saturday. The router still showed the interface up. Users reported "no internet" for six hours because the NAT DIA route stayed in place and the OMP default to Mumbai was never used. The next Monday the team added the tracker and reviewed the policies: kiosks now fail over to backhaul within two minutes, and a weekly test pulls the ISP cable to prove it.</p><p><b>Lesson:</b> link up does not mean internet up. Track the path you depend on.</p></div>

<div class="iv"><p class="q">"What happens to DIA traffic when the local ISP fails, and how do you make it fail over?"</p><p>If only the ISP fails and the interface stays up, the NAT route remains and traffic is black-holed. Configure an endpoint tracker on the NAT transport so the edge detects the failure. With the NAT route the tracker withdraws it and the OMP default (backhaul) takes over; with a data policy the fallback option continues with normal routing. Make sure the data center still advertises a default route.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Choose the pattern: full breakout (route), source-based or application-based breakout (policy), SIG, or Cloud OnRamp.</li>
<li>Application-based DIA uses an app-list; the first packets of a flow may still follow routing.</li>
<li>A tracker on the NAT transport detects a dead ISP; fallback keeps policy traffic flowing.</li>
<li>Keep an OMP default from the DC as the backup path; put NAT only on internet colors.</li>
<li>DIA traffic does not use tunnels, so AAR and BFD do not protect it.</li>
</ul></div>
`,hi:`
<p>Ab aap local exit tak traffic steer karne ke dono tareeke jaante ho. Asli engineering ka sawaal hai <b>kaunsa traffic break out karna hai, aur local exit fail ho to kya hota hai</b>. Yeh chapter aapko design patterns, application-based DIA policy, aur safety net deta hai: NAT DIA tracker aur fallback.</p>

<h3>Analogy: main gate aur side gate wali building</h3>
<p>Visitors aam taur par main gate use karte hain, jahan security unhe check karti hai. Delivery vans time bachane ke liye side gate use karti hain. Agar side gate kharab truck se block ho jaaye, to guard ko vans ko main gate bhejna padega, na ki unhe hamesha ke liye intezaar karne dena. DIA side gate hai; data center main gate hai; <b>tracker</b> woh guard hai jo block hua side gate notice karta hai.</p>

<h3>Design patterns</h3>
<table class="cmp"><tr><th>Pattern</th><th>Tool</th><th>Kiske liye accha</th></tr>
<tr><td>VPN ke liye <b>full local breakout</b></td><td>NAT DIA route</td><td>Chhoti shops, kiosks, jahan saara traffic internet hai</td></tr>
<tr><td><b>Source-based</b> breakout</td><td>Source prefix match karne wali data policy</td><td>Guest Wi-Fi, IoT, contractors</td></tr>
<tr><td><b>Application-based</b> breakout</td><td>App-list match karne wali data policy</td><td>Trusted SaaS (Microsoft 365, Webex), video</td></tr>
<tr><td><b>Sab backhaul</b>, DIA sirf cloud security provider ko</td><td>SIG tunnel ka route ya policy</td><td>Branch security stack ke bina strict inspection</td></tr>
<tr><td><b>Measurement se har application ka best exit</b></td><td>Cloud OnRamp for SaaS</td><td>Kai SaaS apps, kai exits wali branches</td></tr></table>

<h3>Application-based DIA</h3>
<p>Source subnet ki jagah <b>application</b> match karo. Security trusted SaaS applications ki list approve karti hai; sirf wahi locally break out karti hain.</p>
<pre class="code"><span class="c">! VSMART: only approved SaaS breaks out, everything else follows routing</span>
policy
 lists
  app-list TRUSTED-SAAS
   app ms-office-365
   app webex-meeting
 data-policy APP-DIA
  vpn-list CORP
   sequence 10
    match
     app-list TRUSTED-SAAS
    action accept
     nat use-vpn 0 fallback
     count saas-dia
   default-action accept
apply-policy
 site-list PUNE
  data-policy APP-DIA from-service</pre>
<p>Pichhle module se yaad rakho ki edge ko application pehchanne ke liye kuch packets (ya <code>dns-app-list</code> se DNS clue) chahiye, isliye naye flow ke bilkul pehle packets abhi bhi routing table follow kar sakte hain. Jab hard requirement ho ki koi specific SaaS hamesha locally nikle, to match mein SaaS prefixes ya domains bhi jodo.</p>

<h3>Safety net: NAT DIA tracker aur fallback</h3>
<p>NAT DIA route tab tak installed rehta hai jab tak transport interface up aur NAT-enabled hai, <b>chahe uske peeche ISP dead ho</b>. Tab users internet kho dete hain jabki data center ke through ek bilkul theek backhaul path khaali padha rehta hai. <b>Tracker</b> yeh theek karta hai: edge transport se ek internet target ko probe karta hai, aur probe fail hone par DIA exit ko unavailable maanta hai. Tab:</p>
<ul>
<li><b>Route</b> method mein NAT DIA route withdraw ho jaata hai aur traffic OMP default (backhaul) par fall back karta hai.</li>
<li><b>Policy</b> method mein <code>fallback</code> keyword matching traffic ko normal routing lookup ke saath aage badhata hai.</li>
</ul>
<pre class="code"><span class="c">! E-BR1: the tracker, attached to the NAT transport</span>
endpoint-tracker tracker1
 tracker-type interface
 endpoint-dns-name www.bharat.example
 threshold 300
 interval 30
 multiplier 3
!
interface GigabitEthernet1
 ip nat outside
 endpoint-tracker tracker1</pre>
<p>Threshold (100 se 1000 ms) woh hai ki edge probe response ke liye kitna intezaar kare, interval (20 se 600 s) kitni der mein probe bheje, aur multiplier (1 se 10) kitne failed probes tolerate hon. Manager mein tracker System feature template (ya system profile) mein define hota hai aur NAT transport interface ke advanced options mein attach hota hai. Naye releases trackers ko sirf reachability nahi, jitter aur loss bhi dekhne dete hain.</p>
<pre class="out">E-BR1# show endpoint-tracker
Interface          Record Name  Status  RTT in msec  Probe ID  Next Hop
GigabitEthernet1   tracker1     <span class="hl">Up</span>      8            4         203.0.113.9

E-BR1# show endpoint-tracker records
Record Name  Endpoint                  EndPoint Type  Threshold  Multiplier  Interval
tracker1     www.bharat.example        DNS_NAME       300        3           30</pre>

<div class="eg"><p><b>Worked example.</b> Pune ka internet circuit 14:10 par upstream fail hota hai; interface up rehta hai kyunki modem ka link hai. Tracker ke bina NAT DIA route rehta hai aur har user ghanton internet kho deta hai. Upar wale tracker ke saath lagatar teen probes fail hote hain (lagbhag 90 seconds), status Down hota hai, n*Nd route withdraw hota hai, aur users OMP default se Mumbai ke through chalte hain. ISP recover hone par tracker Up hota hai aur NAT route wapas aata hai. <b>Yaad rakho:</b> yeh tabhi kaam karta hai jab data center backup path ke roop mein default route advertise karta rahe.</p></div>

<h3>Aur design details</h3>
<ul>
<li><b>DC default rakho.</b> E-DC ko internet default advertise karte rehna chahiye (hamare lab mein DC-FW default ka <code>advertise static</code>) taaki backhaul fallback ke roop mein exist kare. Use hata do to fail hue local exit ke paas jaane ki jagah nahi bachti.</li>
<li><b>Kin transports par NAT.</b> NAT sirf internet colors par (biz-internet, broadband, backup ke roop mein LTE). Private MPLS transport par kabhi nahi.</li>
<li><b>Kai NAT transports.</b> Ek se zyada internet transport hon to DIA traffic ke routing se unke beech share hone ki ummeed rakho. Maan lene ki jagah service-path tool se verify karo, aur jab per-application best exit chahiye to Cloud OnRamp for SaaS use karo.</li>
<li><b>DIA traffic tunnels use nahi karta.</b> Woh application-aware routing, SLA classes ya IPsec ke under nahi hai: woh internet ki taraf clear mein (application ke TLS ke saath) nikalta hai. Isiliye branch par security matter karti hai (agla chapter).</li>
<li><b>Return traffic.</b> Replies translated address par usi interface par wapas aate hain, isliye asymmetric routing ki problem nahi aati, jaisa kisi doosre NAT se backhaul mein ho sakta hai.</li>
</ul>

<div class="warn"><p><b>Common mistakes.</b> (1) Tracker aur backhaul fallback ke bina DIA enable karna. (2) Aisa target probe karna jo khud firewall policy se blocked ho, jisse false "down" states aati hain. (3) Compliance-restricted app ke liye "sab internet" match karna, jisse woh locally nikalti hai. (4) DIA live hone ke baad DC default route hata dena, jo fallback khatam kar deta hai.</p></div>

<div class="exam"><p><b>Exam trap.</b> <b>Tracker</b> tab failing ISP detect karta hai jab interface abhi bhi up ho; data policy mein <code>fallback</code> decide karta hai ki DIA exit unavailable hone par matched traffic ka kya ho. Dono saath kaam karte hain; koi bhi doosre ki jagah nahi leta. DIA traffic SD-WAN tunnels par nahi chalta, isliye BFD uske liye internet outage detect nahi kar sakta.</p></div>

<div class="scn"><h4>Local internet down, branch khamosh</h4><p>Bharat Retail ke ek kiosk ka broadband upstream Saturday ko fail ho gaya. Router abhi bhi interface up dikha raha tha. Users ne chhe ghante "no internet" report kiya kyunki NAT DIA route jagah par raha aur Mumbai ka OMP default kabhi use nahi hua. Agle Monday team ne tracker joda aur policies review ki: kiosks ab do minute mein backhaul par failover karte hain, aur har hafte ek test ISP cable kheench kar saabit karta hai.</p><p><b>Lesson:</b> link up ka matlab internet up nahi. Jis path par aap depend karte ho use track karo.</p></div>

<div class="iv"><p class="q">"Local ISP fail hone par DIA traffic ka kya hota hai, aur use failover kaise karwate ho?"</p><p>Agar sirf ISP fail ho aur interface up rahe, to NAT route rehta hai aur traffic black-hole hota hai. NAT transport par endpoint tracker configure karo taaki edge failure detect kare. NAT route ke saath tracker use withdraw karta hai aur OMP default (backhaul) sambhal leta hai; data policy ke saath fallback option normal routing se aage badhata hai. Ensure karo ki data center abhi bhi default route advertise karta hai.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Pattern chuno: full breakout (route), source-based ya application-based breakout (policy), SIG, ya Cloud OnRamp.</li>
<li>Application-based DIA app-list use karta hai; flow ke pehle packets abhi bhi routing follow kar sakte hain.</li>
<li>NAT transport par tracker dead ISP detect karta hai; fallback policy traffic ko chalta rakhta hai.</li>
<li>DC se OMP default ko backup path rakho; NAT sirf internet colors par lagao.</li>
<li>DIA traffic tunnels use nahi karta, isliye AAR aur BFD use protect nahi karte.</li>
</ul></div>
`}};export{e as default};