var e={id:`nap-variables`,h:{en:`Network analysis policy and variable sets: HOME_NET matters`,hi:`Network analysis policy aur variable sets: HOME_NET maayne rakhta hai`},body:{en:`
<p>Before a bag goes through the X-ray, an attendant lays it flat, opens the laptop sleeve and takes the liquids out, because a crumpled bag hides shapes. The X-ray picture is only as good as that preparation. The attendant also knows which gates belong to <b>our</b> terminal, so an alarm about a bag heading to our own aircraft gets more attention. In Snort, the preparation step is the <b>network analysis policy (NAP)</b> and the knowledge of "ours versus theirs" lives in the <b>variable set</b>. Engineers often tune the intrusion policy for weeks while these two quietly decide whether the rules can match at all.</p>

<h3>What the network analysis policy does</h3>
<p>Attack traffic does not arrive as a neat string. It can be split across IP fragments, TCP segments that arrive out of order, URL-encoded characters, compressed HTTP bodies, or protocol tricks that confuse a naive scanner. The NAP configures Snort's <b>inspectors</b> (Snort 2 called them preprocessors) that decode, normalise and reassemble traffic <b>before</b> intrusion rules look at it:</p>
<dl class="terms">
<dt>Decoders and normalizers</dt><dd>Check IP and TCP headers, remove ambiguities, and in inline mode can rewrite or drop malformed packets.</dd>
<dt>stream_ip / stream_tcp</dt><dd>Defragment IP packets and reassemble TCP sessions so a rule sees the whole request.</dd>
<dt>h&#116;tp_inspect</dt><dd>Parses HTTP, decodes percent-encoding and compression, and splits URI, headers and body so rules can target each part.</dd>
<dt>Other inspectors</dt><dd>ssl, dns, smtp, ftp_telnet, sip, dce_rpc, ARP spoof and more. Each can also raise its own built-in events.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="NAP before intrusion rules">
<rect x="20" y="60" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="12">Raw packets</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">fragments, %41</text>
<rect x="170" y="40" width="190" height="100" rx="10" fill="#bae6fd"/><text x="265" y="66" text-anchor="middle" class="svg-ink" font-size="13">Network analysis policy</text><text x="265" y="88" text-anchor="middle" class="svg-muted" font-size="12">defrag, stream reassembly</text><text x="265" y="106" text-anchor="middle" class="svg-muted" font-size="12">HTTP decode, normalise</text><text x="265" y="124" text-anchor="middle" class="svg-muted" font-size="12">variables: HOME_NET...</text>
<rect x="390" y="40" width="110" height="100" rx="10" fill="#bbf7d0"/><text x="445" y="86" text-anchor="middle" class="svg-ink" font-size="13">Intrusion</text><text x="445" y="104" text-anchor="middle" class="svg-ink" font-size="13">rules</text>
<rect x="530" y="60" width="95" height="60" rx="8" fill="#fde68a"/><text x="577" y="94" text-anchor="middle" class="svg-ink" font-size="12">Verdict</text>
<line x1="140" y1="90" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="90" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Rules can only match what the NAP has reassembled and decoded</text>
</svg><p class="cap">The NAP prepares the traffic; the intrusion policy judges it.</p></div>

<h3>Where the NAP is set</h3>
<p>NAPs come from the same Talos bases (Balanced Security and Connectivity and so on). In the access control policy, open <b>Advanced, Network Analysis and Intrusion Policies</b>. There you set the <b>Default Network Analysis Policy</b>, the <b>intrusion policy used before the access control rule is determined</b> (for the first packets while AppID and URL are still pending), the default variable set, and optional <b>network analysis rules</b> that assign a different NAP to specific zones or networks. For Snort 3 you customise inspectors with overrides in the NAP editor; most networks keep the base and change very little.</p>

<h3>Variable sets</h3>
<p>Rules use variables such as <code>$HOME_NET</code> and <code>$HTTP_SERVERS</code>. Their values come from a <b>variable set</b> (Objects, Object Management, Variable Set). Every access control rule that has an intrusion policy also chooses a variable set on its Inspection tab. The built-in <b>Default-Set</b> has <code>HOME_NET = any</code> and <code>EXTERNAL_NET = any</code>.</p>
<table class="cmp"><tr><th>Variable</th><th>Default</th><th>NK value</th></tr>
<tr><td>HOME_NET</td><td>any</td><td>10.0.1.0/24, 10.0.2.0/24</td></tr>
<tr><td>EXTERNAL_NET</td><td>any</td><td>any (keeps internal-to-internal detection)</td></tr>
<tr><td>HTTP_SERVERS</td><td>$HOME_NET</td><td>10.0.2.10</td></tr>
<tr><td>HTTP_PORTS</td><td>long list of web ports</td><td>default plus 8080</td></tr>
<tr><td>DNS_SERVERS, SMTP_SERVERS, SQL_SERVERS</td><td>$HOME_NET</td><td>the real servers</td></tr></table>

<pre class="code"><span class="c">! Objects &gt; Object Management &gt; Variable Set &gt; Add Variable Set</span>
Name: NK-VARS
  HOME_NET      = [10.0.1.0/24, 10.0.2.0/24]
  HTTP_SERVERS  = [10.0.2.10]
  EXTERNAL_NET  = any
<span class="c">! NK-ACP &gt; Web-In &gt; Inspection: Intrusion Policy NK-WEB-IPS, Variable Set NK-VARS</span>
Deploy</pre>

<pre class="out">&gt; system support trace
198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 Firewall: allow rule, 'Web-In', allow
198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 IPS Event: gid 1, sid 58001, drop
<span class="hl">198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 Snort id 0, NAP id 1, IPS id 0, Verdict BLACKLIST</span>
198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 ===&gt; Blocked by IPS</pre>
<p>The trace names the NAP and intrusion policy that inspected the flow: proof that the right policies were applied.</p>

<div class="eg"><p><b>Worked example: the web server that moved ports.</b> The developers move WEB to TCP 8080. Old Snort 2 style rules limited to <code>$HTTP_PORTS</code> would miss attacks on 8080 if 8080 were not in the list, because <code>h&#116;tp_inspect</code> would not parse it as HTTP. Snort 3 is better: rules with <code>service:h&#116;tp</code> match when AppID identifies HTTP on any port. Still, the team adds 8080 to HTTP_PORTS in NK-VARS and confirms with a test request that SID 58001 fires on the new port.</p></div>

<div class="warn"><p><b>Common mistake.</b> Setting <code>EXTERNAL_NET = !HOME_NET</code> because a template said so. Every rule written <code>$EXTERNAL_NET -&gt; $HOME_NET</code> then ignores attacks from one internal host to another, which is exactly how ransomware spreads. Keep EXTERNAL_NET as any unless you have a strong performance reason and other east-west controls.</p></div>

<div class="exam"><p><b>Exam trap.</b> The variable set is chosen per access control rule together with the intrusion policy, not inside the intrusion policy. The NAP is chosen in the access control policy's Advanced tab, not on the rule. The "intrusion policy used before the access control rule is determined" inspects the first packets while the match is still pending.</p></div>

<div class="scn"><h4>The data centre IPS that never fired</h4><p>A university's data centre Threat Defense showed zero intrusion events for three months, even after a penetration test. The engineer checked the variable set: HOME_NET had been set to the old campus range 172.16.0.0/16, while the servers had moved to 10.20.0.0/16. Rules for attacks <code>-&gt; $HOME_NET</code> never matched. After correcting HOME_NET and redeploying, the next scan produced the expected events.</p><p><b>Lesson:</b> wrong variables silently switch rules off.</p></div>

<div class="iv"><p class="q">"What is the difference between a network analysis policy and an intrusion policy?"</p><p>The NAP configures inspectors that decode, normalise, defragment and reassemble traffic and can raise protocol-anomaly events; the intrusion policy decides which signatures run and what they do. The NAP runs first; rules can only match prepared traffic. Mention where each is set (NAP in Advanced settings of the access control policy, intrusion policy and variable set per rule), HOME_NET and EXTERNAL_NET choices, and that Snort 3 uses service identification so port variables matter less.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The NAP's inspectors defragment, reassemble and decode traffic before intrusion rules run.</li>
<li>NAP and the pre-match intrusion policy are set in the access control policy's Advanced tab.</li>
<li>Variable sets fill $HOME_NET, $HTTP_SERVERS and friends; chosen per rule with the intrusion policy.</li>
<li>Default-Set uses any; set HOME_NET to your real networks and keep EXTERNAL_NET as any.</li>
<li>Wrong variables make rules silently miss attacks.</li>
</ul></div>
`,hi:`
<p>Bag X-ray se guzarne se pehle ek attendant use seedha bichhata hai, laptop sleeve kholta hai aur liquids nikaalta hai, kyunki sikuda hua bag shapes chhupa leta hai. X-ray tasveer utni hi achhi hoti hai jitni woh taiyaari. Attendant yeh bhi jaanta hai ki kaunse gates <b>hamare</b> terminal ke hain, isliye hamare apne aircraft ki taraf jaane wale bag ke alarm par zyada dhyan diya jaata hai. Snort mein taiyaari wala step <b>network analysis policy (NAP)</b> hai aur "hamara vs unka" ki jaankari <b>variable set</b> mein rehti hai. Engineers aksar hafton intrusion policy tune karte rehte hain jabki yeh dono chupchaap decide karte hain ki rules match ho bhi sakti hain ya nahi.</p>

<h3>Network analysis policy kya karti hai</h3>
<p>Attack traffic saaf string ki tarah nahi aata. Woh IP fragments mein bata ho sakta hai, TCP segments ulte order mein aa sakte hain, URL-encoded characters ho sakte hain, compressed HTTP bodies, ya protocol tricks jo naive scanner ko confuse karein. NAP Snort ke <b>inspectors</b> (Snort 2 inhe preprocessors kehta tha) configure karti hai jo intrusion rules ke dekhne se <b>pehle</b> traffic ko decode, normalise aur reassemble karte hain:</p>
<dl class="terms">
<dt>Decoders aur normalizers</dt><dd>IP aur TCP headers check karte hain, ambiguities hatate hain, aur inline mode mein malformed packets rewrite ya drop kar sakte hain.</dd>
<dt>stream_ip / stream_tcp</dt><dd>IP packets defragment karte hain aur TCP sessions reassemble karte hain taaki rule poori request dekhe.</dd>
<dt>h&#116;tp_inspect</dt><dd>HTTP parse karta hai, percent-encoding aur compression decode karta hai, aur URI, headers aur body alag karta hai taaki rules har hisse ko target kar sakein.</dd>
<dt>Doosre inspectors</dt><dd>ssl, dns, smtp, ftp_telnet, sip, dce_rpc, ARP spoof aur aur bhi. Har ek apne built-in events bhi utha sakta hai.</dd>
</dl>

<div class="dia"><svg viewBox="0 0 640 220" role="img" aria-label="Intrusion rules se pehle NAP">
<rect x="20" y="60" width="120" height="60" rx="8" fill="#e2e8f0"/><text x="80" y="86" text-anchor="middle" class="svg-ink" font-size="12">Raw packets</text><text x="80" y="104" text-anchor="middle" class="svg-muted" font-size="12">fragments, %41</text>
<rect x="170" y="40" width="190" height="100" rx="10" fill="#bae6fd"/><text x="265" y="66" text-anchor="middle" class="svg-ink" font-size="13">Network analysis policy</text><text x="265" y="88" text-anchor="middle" class="svg-muted" font-size="12">defrag, stream reassembly</text><text x="265" y="106" text-anchor="middle" class="svg-muted" font-size="12">HTTP decode, normalise</text><text x="265" y="124" text-anchor="middle" class="svg-muted" font-size="12">variables: HOME_NET...</text>
<rect x="390" y="40" width="110" height="100" rx="10" fill="#bbf7d0"/><text x="445" y="86" text-anchor="middle" class="svg-ink" font-size="13">Intrusion</text><text x="445" y="104" text-anchor="middle" class="svg-ink" font-size="13">rules</text>
<rect x="530" y="60" width="95" height="60" rx="8" fill="#fde68a"/><text x="577" y="94" text-anchor="middle" class="svg-ink" font-size="12">Verdict</text>
<line x1="140" y1="90" x2="170" y2="90" stroke="#64748b" stroke-width="2"/><line x1="360" y1="90" x2="390" y2="90" stroke="#64748b" stroke-width="2"/><line x1="500" y1="90" x2="530" y2="90" stroke="#64748b" stroke-width="2"/>
<text x="320" y="185" text-anchor="middle" class="svg-accent" font-size="12">Rules sirf wahi match kar sakti hain jo NAP ne reassemble aur decode kiya</text>
</svg><p class="cap">NAP traffic taiyaar karti hai; intrusion policy uska faisla karti hai.</p></div>

<h3>NAP kahan set hoti hai</h3>
<p>NAPs bhi wahi Talos bases se aati hain (Balanced Security and Connectivity waghera). Access control policy mein <b>Advanced, Network Analysis and Intrusion Policies</b> kholo. Wahan aap <b>Default Network Analysis Policy</b>, <b>access control rule decide hone se pehle use hone wali intrusion policy</b> (pehle packets ke liye jab AppID aur URL abhi pending hain), default variable set, aur optional <b>network analysis rules</b> set karte ho jo khaas zones ya networks ko alag NAP dete hain. Snort 3 ke liye aap NAP editor mein overrides se inspectors customise karte ho; zyada tar networks base rakhte hain aur bahut kam badalte hain.</p>

<h3>Variable sets</h3>
<p>Rules <code>$HOME_NET</code> aur <code>$HTTP_SERVERS</code> jaise variables use karti hain. Unki values <b>variable set</b> se aati hain (Objects, Object Management, Variable Set). Intrusion policy wali har access control rule apne Inspection tab par ek variable set bhi chunti hai. Built-in <b>Default-Set</b> mein <code>HOME_NET = any</code> aur <code>EXTERNAL_NET = any</code> hai.</p>
<table class="cmp"><tr><th>Variable</th><th>Default</th><th>NK value</th></tr>
<tr><td>HOME_NET</td><td>any</td><td>10.0.1.0/24, 10.0.2.0/24</td></tr>
<tr><td>EXTERNAL_NET</td><td>any</td><td>any (internal-se-internal detection bani rehti hai)</td></tr>
<tr><td>HTTP_SERVERS</td><td>$HOME_NET</td><td>10.0.2.10</td></tr>
<tr><td>HTTP_PORTS</td><td>web ports ki lambi list</td><td>default plus 8080</td></tr>
<tr><td>DNS_SERVERS, SMTP_SERVERS, SQL_SERVERS</td><td>$HOME_NET</td><td>asli servers</td></tr></table>

<pre class="code"><span class="c">! Objects &gt; Object Management &gt; Variable Set &gt; Add Variable Set</span>
Name: NK-VARS
  HOME_NET      = [10.0.1.0/24, 10.0.2.0/24]
  HTTP_SERVERS  = [10.0.2.10]
  EXTERNAL_NET  = any
<span class="c">! NK-ACP &gt; Web-In &gt; Inspection: Intrusion Policy NK-WEB-IPS, Variable Set NK-VARS</span>
Deploy</pre>

<pre class="out">&gt; system support trace
198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 Firewall: allow rule, 'Web-In', allow
198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 IPS Event: gid 1, sid 58001, drop
<span class="hl">198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 Snort id 0, NAP id 1, IPS id 0, Verdict BLACKLIST</span>
198.51.100.10-51734 &gt; 10.0.2.10-80 6 AS 1-1 I 0 ===&gt; Blocked by IPS</pre>
<p>Trace flow inspect karne wali NAP aur intrusion policy ka naam deta hai: saboot ki sahi policies lagi.</p>

<div class="eg"><p><b>Worked example: web server jisne ports badle.</b> Developers WEB ko TCP 8080 par le jaate hain. <code>$HTTP_PORTS</code> tak seemit purane Snort 2 style rules 8080 par attacks miss kar deti agar 8080 list mein na hota, kyunki <code>h&#116;tp_inspect</code> use HTTP ki tarah parse nahi karta. Snort 3 behtar hai: <code>service:h&#116;tp</code> wali rules tab match karti hain jab AppID kisi bhi port par HTTP pehchane. Phir bhi team NK-VARS mein HTTP_PORTS mein 8080 jodti hai aur test request se confirm karti hai ki naye port par SID 58001 fire hoti hai.</p></div>

<div class="warn"><p><b>Common galti.</b> Template ke kehne par <code>EXTERNAL_NET = !HOME_NET</code> set karna. Tab <code>$EXTERNAL_NET -&gt; $HOME_NET</code> likhi har rule ek internal host se doosre internal host ke attacks ignore karti hai, aur ransomware bilkul aise hi failta hai. Jab tak strong performance reason aur doosre east-west controls na hon, EXTERNAL_NET ko any rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> Variable set har access control rule par intrusion policy ke saath chuna jaata hai, intrusion policy ke andar nahi. NAP access control policy ke Advanced tab mein chuni jaati hai, rule par nahi. "Access control rule decide hone se pehle use hone wali intrusion policy" pehle packets inspect karti hai jab match abhi pending hai.</p></div>

<div class="scn"><h4>Data centre IPS jo kabhi fire nahi hua</h4><p>Ek university ke data centre Threat Defense ne teen mahine tak zero intrusion events dikhaye, penetration test ke baad bhi. Engineer ne variable set check kiya: HOME_NET purani campus range 172.16.0.0/16 par set tha, jabki servers 10.20.0.0/16 par shift ho chuke the. <code>-&gt; $HOME_NET</code> wale attacks ki rules kabhi match nahi hui. HOME_NET theek karke redeploy karne ke baad agle scan ne expected events banaye.</p><p><b>Lesson:</b> galat variables chupchaap rules band kar dete hain.</p></div>

<div class="iv"><p class="q">"Network analysis policy aur intrusion policy mein kya fark hai?"</p><p>NAP un inspectors ko configure karti hai jo traffic decode, normalise, defragment aur reassemble karte hain aur protocol-anomaly events utha sakte hain; intrusion policy decide karti hai kaunse signatures chalenge aur kya karenge. NAP pehle chalti hai; rules sirf taiyaar traffic match kar sakti hain. Batao har ek kahan set hoti hai (NAP access control policy ki Advanced settings mein, intrusion policy aur variable set har rule par), HOME_NET aur EXTERNAL_NET choices, aur yeh ki Snort 3 service identification use karta hai isliye port variables kam maayne rakhte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>NAP ke inspectors intrusion rules chalne se pehle traffic defragment, reassemble aur decode karte hain.</li>
<li>NAP aur pre-match intrusion policy access control policy ke Advanced tab mein set hoti hain.</li>
<li>Variable sets $HOME_NET, $HTTP_SERVERS waghera bharte hain; har rule par intrusion policy ke saath chune jaate hain.</li>
<li>Default-Set any use karta hai; HOME_NET ko apne asli networks par set karo aur EXTERNAL_NET ko any rakho.</li>
<li>Galat variables rules ko chupchaap attacks miss karwa dete hain.</li>
</ul></div>
`}};export{e as default};