var e={id:`policy-nat-minimum`,h:{en:`Just enough policy and NAT to pass user traffic`,hi:`User traffic pass karne layak policy aur NAT`},body:{en:`
<p><b>Analogy: opening the shop door and printing the signboard.</b> Interfaces, zones and routes build the shop. To serve customers you still need a rule that says who may enter, and, because the shop uses a private address, a way to present the public address to the street. That is security policy and source NAT. This chapter gives you the minimum to prove end-to-end connectivity; the full treatment is in pan-policy and pan-nat.</p>

<h3>Default behaviour you already know</h3>
<p>With no rules, traffic between different zones is denied (interzone-default) and traffic inside one zone is allowed (intrazone-default). So after the first lab's interfaces are built, PC1 in trust cannot reach 8.8.8.8 in untrust even though the route exists. You can prove it before writing a rule:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).

PC1&gt; ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
...</pre>

<h3>One outbound rule</h3>
<pre class="code">set rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow
commit</pre>
<p>Read it: "From trust to untrust, any source and destination, these four applications on their default ports: allow." Source and destination are required fields; leaving them out fails the commit with "source is missing".</p>

<h3>Source NAT so replies come back</h3>
<p>PC1's address 10.0.1.10 is private and is not routable on the internet. The firewall translates it to its own untrust address with <b>dynamic IP and port</b> translation (often called PAT or interface NAT):</p>
<pre class="code">set rulebase nat rules SNAT-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
commit</pre>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"SNAT-Out; index: 1" {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        destination any;
        service any;
        <span class="hl">translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>Two rulebases, two jobs. The <b>security</b> rulebase allows or denies. The <b>NAT</b> rulebase translates. A flow needs the security rule to pass and the NAT rule to be answered by the internet. A useful memory trick: NAT rules are matched on the <i>original</i> zones and addresses, and security rules match the original addresses too but the <i>post-NAT zone</i>. For this simple outbound case both use trust to untrust.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Policy and NAT">
<rect x="10" y="45" width="100" height="55" rx="8" fill="#e2e8f0"/><text x="60" y="68" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="60" y="86" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="170" y="35" width="300" height="75" rx="10" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">security rule Allow-Out, then NAT SNAT-Out</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10 becomes 203.0.113.2</text>
<rect x="530" y="45" width="100" height="55" rx="8" fill="#e2e8f0"/><text x="580" y="68" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text><text x="580" y="86" text-anchor="middle" class="svg-muted" font-size="12">INET-SRV</text>
<line x1="110" y1="72" x2="170" y2="72" stroke="#64748b" stroke-width="2"/><line x1="470" y1="72" x2="530" y2="72" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">The user's private address is translated to the interface address on the way out.</p></div>

<h3>Proving it works end to end</h3>
<pre class="out">PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms
...

admin@NK-PUNE-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])</pre>
<p>The session shows application <code>ping</code>, trust to untrust, and the translated source 203.0.113.2. Flag <code>NS</code> marks source NAT. If the ping fails, the checks in the next chapter apply in order.</p>

<div class="eg"><p><b>Worked example.</b> A manager asks for "browsing only" from the LAN. Rule applications: dns, web-browsing, ssl. A user's SSH to a public server matches no rule and is denied by the interzone default. A user's ping works because ping is in the list. To block ping you would remove it from the list, not add a deny.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Writing the NAT rule but no security rule (traffic is denied) or the security rule but no NAT (replies never return). Using application <code>any</code> to "make it work". Forgetting that application-default needs the application names that the traffic really is: web-browsing for clear web, ssl for encrypted.</p></div>
<div class="exam"><p><b>Exam trap.</b> Security policy and NAT policy are separate rulebases evaluated for the same flow. NAT does not allow traffic by itself. The security rule is matched with the original source and destination addresses and the original source zone, with the destination zone taken after NAT where relevant.</p></div>

<div class="scn"><h4>NAT without policy</h4><p>A branch admin added source NAT and saw "NAT working" in the translation table, yet users could not browse. The NAT rule existed but no security rule allowed trust to untrust, so the interzone default dropped every session before it started. Adding one outbound rule fixed it.</p><p><b>Lesson:</b> NAT translates; only security policy permits.</p></div>

<div class="iv"><p class="q">"Do you need both a security rule and a NAT rule for outbound internet access?"</p><p>Yes. The security rule permits the session between the zones; the NAT rule translates the private source to a routable address so replies come back. Without the security rule the interzone default denies; without NAT the internet cannot return traffic to a private address.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interzone-default denies, so you need an allow rule for each needed flow.</li>
<li>A rule requires from, to, source, destination, application, service and action.</li>
<li>Source NAT with interface address translates private sources on the way out.</li>
<li>Security and NAT are separate rulebases for the same flow.</li>
<li>show session all proves application, zones and translation.</li>
</ul></div>
`,hi:`
<p><b>Analogy: dukaan ka darwaza kholna aur signboard chhapna.</b> Interfaces, zones aur routes dukaan banate hain. Customers ko serve karne ke liye aapko phir bhi ek rule chahiye jo kahe kaun andar aa sakta hai, aur kyunki dukaan private address use karti hai, sadak ko public address dikhane ka tareeka bhi. Wahi security policy aur source NAT hai. Yeh chapter end-to-end connectivity saabit karne ka minimum deta hai; poora treatment pan-policy aur pan-nat mein hai.</p>

<h3>Default behaviour jo aap jaante ho</h3>
<p>Rules ke bina alag zones ke beech traffic denied hai (interzone-default) aur ek zone ke andar allowed (intrazone-default). Isliye pehle lab ke interfaces banne ke baad bhi trust ka PC1 8.8.8.8 tak nahi pahunchta, route hone ke bavajood. Rule likhne se pehle aap yeh saabit kar sakte ho:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
No rule matched. Traffic falls to the predefined "interzone-default" rule (action deny).

PC1&gt; ping 8.8.8.8
8.8.8.8 icmp_seq=1 timeout
8.8.8.8 icmp_seq=2 timeout
...</pre>

<h3>Ek outbound rule</h3>
<pre class="code">set rulebase security rules Allow-Out from trust to untrust source any destination any application [ ping dns web-browsing ssl ] service application-default action allow
commit</pre>
<p>Ise padho: "Trust se untrust, koi bhi source aur destination, yeh chaar applications unke default ports par: allow." Source aur destination required fields hain; unhe chhodne par commit "source is missing" ke saath fail hota hai.</p>

<h3>Source NAT taaki replies wapas aayein</h3>
<p>PC1 ka address 10.0.1.10 private hai aur internet par routable nahi. Firewall use apne untrust address mein <b>dynamic IP and port</b> translation (aksar PAT ya interface NAT kehte hain) se translate karta hai:</p>
<pre class="code">set rulebase nat rules SNAT-Out from trust to untrust source any destination any service any source-translation dynamic-ip-and-port interface-address interface ethernet1/1
commit</pre>
<pre class="out">admin@NK-PUNE-PA&gt; show running nat-policy
"SNAT-Out; index: 1" {
        nat-type ipv4;
        from trust;
        source any;
        to untrust;
        destination any;
        service any;
        <span class="hl">translate-to "src: ethernet1/1 203.0.113.2 (dynamic-ip-and-port)";</span>
        terminal no;
}</pre>
<p>Do rulebases, do kaam. <b>Security</b> rulebase allow ya deny karta hai. <b>NAT</b> rulebase translate karta hai. Flow ko pass hone ke liye security rule aur internet se jawab pane ke liye NAT rule chahiye. Yaad rakhne ki trick: NAT rules <i>original</i> zones aur addresses par match hote hain, aur security rules original addresses par match hote hain lekin <i>post-NAT zone</i> ke saath. Is simple outbound case mein dono trust se untrust use karte hain.</p>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Policy aur NAT">
<rect x="10" y="45" width="100" height="55" rx="8" fill="#e2e8f0"/><text x="60" y="68" text-anchor="middle" class="svg-ink" font-size="13">PC1</text><text x="60" y="86" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10</text>
<rect x="170" y="35" width="300" height="75" rx="10" fill="#ddd6fe"/><text x="320" y="62" text-anchor="middle" class="svg-ink" font-size="14">Firewall</text><text x="320" y="82" text-anchor="middle" class="svg-muted" font-size="12">security rule Allow-Out, phir NAT SNAT-Out</text><text x="320" y="100" text-anchor="middle" class="svg-muted" font-size="12">10.0.1.10 ban jaata hai 203.0.113.2</text>
<rect x="530" y="45" width="100" height="55" rx="8" fill="#e2e8f0"/><text x="580" y="68" text-anchor="middle" class="svg-ink" font-size="13">8.8.8.8</text><text x="580" y="86" text-anchor="middle" class="svg-muted" font-size="12">INET-SRV</text>
<line x1="110" y1="72" x2="170" y2="72" stroke="#64748b" stroke-width="2"/><line x1="470" y1="72" x2="530" y2="72" stroke="#64748b" stroke-width="2"/>
</svg><p class="cap">User ka private address bahar jaate waqt interface address mein translate hota hai.</p></div>

<h3>End to end saabit karna</h3>
<pre class="out">PC1&gt; ping 8.8.8.8
84 bytes from 8.8.8.8 icmp_seq=1 ttl=62 time=0.500 ms
84 bytes from 8.8.8.8 icmp_seq=2 ttl=62 time=0.600 ms
...

admin@NK-PUNE-PA&gt; show session all
ID           Application    State   Type Flag  Src[Sport]/Zone/Proto (translated IP[Port])
Vsys                                           Dst[Dport]/Zone (translated IP[Port])
9361         ping           ACTIVE  FLOW NS    10.0.1.10[19499]/trust/1  (203.0.113.2[40001])
vsys1                                          8.8.8.8[8]/untrust  (8.8.8.8[8])</pre>
<p>Session application <code>ping</code>, trust se untrust, aur translated source 203.0.113.2 dikhata hai. Flag <code>NS</code> source NAT dikhata hai. Ping fail ho to agle chapter ki checks order mein lagti hain.</p>

<div class="eg"><p><b>Worked example.</b> Manager LAN se "sirf browsing" maangta hai. Rule applications: dns, web-browsing, ssl. User ka public server par SSH kisi rule se match nahi karta aur interzone default se denied hota hai. User ka ping chalta hai kyunki ping list mein hai. Ping block karna ho to use list se hatao, deny mat jodo.</p></div>

<div class="warn"><p><b>Common mistakes.</b> NAT rule likhna lekin security rule nahi (traffic denied) ya security rule likhna lekin NAT nahi (replies kabhi wapas nahi aate). "Chalane ke liye" application <code>any</code> use karna. Yeh bhool jaana ki application-default ko wahi application names chahiye jo traffic asal mein hai: clear web ke liye web-browsing, encrypted ke liye ssl.</p></div>
<div class="exam"><p><b>Exam trap.</b> Security policy aur NAT policy alag rulebases hain jo ek hi flow ke liye evaluate hote hain. NAT akele traffic allow nahi karta. Security rule original source aur destination addresses aur original source zone ke saath match hota hai, aur jahan relevant ho destination zone NAT ke baad ka liya jaata hai.</p></div>

<div class="scn"><h4>Policy ke bina NAT</h4><p>Ek branch admin ne source NAT jodi aur translation table mein "NAT working" dekha, phir bhi users browse nahi kar paye. NAT rule thi lekin trust se untrust allow karne wala koi security rule nahi tha, isliye interzone default har session ko shuru hone se pehle drop kar deta tha. Ek outbound rule jodne se fix hua.</p><p><b>Lesson:</b> NAT translate karta hai; sirf security policy permit karti hai.</p></div>

<div class="iv"><p class="q">"Outbound internet access ke liye security rule aur NAT rule dono chahiye?"</p><p>Haan. Security rule zones ke beech session permit karta hai; NAT rule private source ko routable address mein translate karta hai taaki replies wapas aayein. Security rule ke bina interzone default deny karta hai; NAT ke bina internet private address ko traffic wapas nahi bhej sakta.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Interzone-default deny karta hai, isliye har zaroori flow ke liye allow rule chahiye.</li>
<li>Rule ko from, to, source, destination, application, service aur action chahiye.</li>
<li>Interface address ke saath source NAT private sources ko bahar jaate waqt translate karta hai.</li>
<li>Security aur NAT ek hi flow ke liye alag rulebases hain.</li>
<li>show session all application, zones aur translation saabit karta hai.</li>
</ul></div>
`}};export{e as default};