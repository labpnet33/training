var e={id:`attach-flow`,h:{en:`How profiles attach to a rule and where they sit in the flow`,hi:`Profiles rule par kaise lagte hain aur flow mein kahan baithte hain`},body:{en:`
<p>Profiles do not act on their own. A profile starts working when it is referenced by an <b>allow</b> rule that a session matches. That means three things: the rule must match the session, the rule action must be allow, and the rule must name the profile (or a group of profiles). If any of the three is missing nothing is inspected, and nothing tells you so unless you look.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Where profiles sit in the flow"><rect x="20" y="20" width="99" height="74" rx="10" fill="#bae6fd"/><text x="69.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Session</text><text x="69.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">first packet</text><line x1="122" y1="57" x2="142" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="142,57 136,53 136,61" fill="#64748b"/><rect x="145" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="194.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Rule match</text><text x="194.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">zones, app</text><line x1="247" y1="57" x2="267" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="267,57 261,53 261,61" fill="#64748b"/><rect x="270" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="319.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Action</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">allow?</text><line x1="372" y1="57" x2="392" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="392,57 386,53 386,61" fill="#64748b"/><rect x="395" y="20" width="99" height="74" rx="10" fill="#fde68a"/><text x="444.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Profiles</text><text x="444.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">group on rule</text><line x1="497" y1="57" x2="517" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="517,57 511,53 511,61" fill="#64748b"/><rect x="520" y="20" width="99" height="74" rx="10" fill="#fed7aa"/><text x="569.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">5 Log</text><text x="569.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">traffic + threat</text></svg><p class="cap">Profiles run after the rule decision and only for allowed sessions.</p></div>
<h3>The policy side, captured from the simulator</h3>
<p>Take the rule from the policy module: <code>Allow-Out</code> allows ping, dns, web-browsing and ssl from trust to untrust. Ask the firewall which rule decides for a web request on TCP 443. This is the rule you would attach profiles to:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">"Allow-Out; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
<span class="hl">        action allow;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>The line <code>action allow</code> is the precondition for inspection. After a real request, the session detail tells you how the firewall handled the session. These lines come from <code>show session id</code> in the simulator:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
	layer7 packet count(c2s)             : 3
	layer7 packet count(s2c)             : 2
	application                          : web-browsing
	rule                                 : Allow-Out
	nat-rule                             : SNAT-Out(vsys1)
<span class="hl">	layer7 processing                    : enabled</span>
<span class="hl">	URL filtering enabled                : False</span>
	ingress interface                    : ethernet1/2
	egress interface                     : ethernet1/1
	session QoS rule                     : N/A (class 4)</pre>
<p>Read the two highlighted lines. <code>layer7 processing : enabled</code> means the session is under App-ID. <code>URL filtering enabled : False</code> says that <b>no URL filtering profile applies to this session</b>, because <code>Allow-Out</code> in the simulator has no profile attached. On a real firewall with a URL filtering profile attached to the matching rule, that line reads True. This is the fastest single check for "is my profile being applied to this session?".</p>
<h3>Individual profiles or a profile group</h3>
<p>A rule can point to each profile type separately, or to one <b>profile group</b> that bundles them. Groups win in practice because you change the group once and every rule that uses it follows. The shape of the configuration is:</p>
<pre class="code"># Reference configuration (not run in the simulator)
set profile-group NK-Strict virus NK-AV vulnerability NK-VP url-filtering NK-URL wildfire-analysis NK-WF
set rulebase security rules Allow-Out profile-setting group NK-Strict</pre>
<p>In the simulator the second line is rejected with <code>Invalid syntax</code> (shown in the previous chapter), which is expected. On a real firewall, rules also show a profile icon, and traffic logs record which profile group applied.</p>
<h3>Three places where inspection quietly disappears</h3>
<ol><li><b>Wrong rule.</b> An earlier allow rule without profiles matches first. This is the rule-order problem of the policy module in a new costume.</li><li><b>Encrypted traffic.</b> Without a decryption policy the firewall cannot see inside TLS. Antivirus, vulnerability and WildFire need the payload; URL filtering can still use the server name for categorisation. Decryption is its own topic.</li><li><b>Stale content.</b> The profile exists but the signatures are old because content updates are not scheduled or the subscription expired.</li></ol>
<div class="warn"><p><b>Common mistake.</b> Assuming that creating a profile enforces it. A profile does nothing until a rule that allows the traffic references it.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profiles are evaluated for the rule the session matched. If two allow rules could match, only the first one decides, and only its profiles apply.</p></div>
<div class="scn"><h4>The group on the wrong rule</h4><p>The security team attached the profile group to the rule called Allow-Web, but the traffic of the finance subnet matched an older rule Finance-Out above it that had no group. Finance traffic was never inspected for months. <code>test security-policy-match</code> for a finance host showed Finance-Out; the group was added to that rule as well and the old rule was later merged into Allow-Web.</p><p><b>Lesson:</b> attach profiles to the rule that really matches, and check with the test command.</p></div>
<div class="iv"><p class="q">"A profile group is attached to a rule but a threat was not logged. What do you check?"</p><p>First, which rule the session really matched (test security-policy-match, session detail), then whether that rule is an allow rule with the group attached, whether the traffic was encrypted and not decrypted, and whether the content updates are current and the subscription valid. I also check whether the profile action is alert or block and where the log is forwarded.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>A profile needs a matching allow rule that references it.</li><li>Use a profile group so one change updates every rule.</li><li><code>show session id</code> shows whether URL filtering applies to the session.</li><li>Encryption, rule order and stale content are the three silent gaps.</li></ul></div>
`,hi:`
<p>Profiles apne aap kaam nahi karte. Profile tab kaam karna shuru karta hai jab usse <b>allow</b> rule reference kare jise session match kare. Iska matlab teen cheezein: rule session se match kare, rule action allow ho, aur rule profile (ya profiles ke group) ka naam le. Teeno mein se koi ek na ho to kuch inspect nahi hota, aur jab tak aap dekho nahi koi batata nahi.</p>
<div class="dia"><svg viewBox="0 0 640 114" role="img" aria-label="Flow mein profiles kahan baithte hain"><rect x="20" y="20" width="99" height="74" rx="10" fill="#bae6fd"/><text x="69.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">1 Session</text><text x="69.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">pehla packet</text><line x1="122" y1="57" x2="142" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="142,57 136,53 136,61" fill="#64748b"/><rect x="145" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="194.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">2 Rule match</text><text x="194.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">zones, app</text><line x1="247" y1="57" x2="267" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="267,57 261,53 261,61" fill="#64748b"/><rect x="270" y="20" width="99" height="74" rx="10" fill="#bbf7d0"/><text x="319.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">3 Action</text><text x="319.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">allow?</text><line x1="372" y1="57" x2="392" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="392,57 386,53 386,61" fill="#64748b"/><rect x="395" y="20" width="99" height="74" rx="10" fill="#fde68a"/><text x="444.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">4 Profiles</text><text x="444.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">rule par group</text><line x1="497" y1="57" x2="517" y2="57" stroke="#64748b" stroke-width="2"/><polygon points="517,57 511,53 511,61" fill="#64748b"/><rect x="520" y="20" width="99" height="74" rx="10" fill="#fed7aa"/><text x="569.5" y="50" text-anchor="middle" class="svg-ink" font-size="13">5 Log</text><text x="569.5" y="72" text-anchor="middle" class="svg-muted" font-size="11">traffic + threat</text></svg><p class="cap">Profiles rule decision ke baad aur sirf allowed sessions ke liye chalte hain.</p></div>
<h3>Policy side, simulator se capture</h3>
<p>Policy module ki rule lo: <code>Allow-Out</code> trust se untrust ke liye ping, dns, web-browsing aur ssl allow karti hai. Firewall se poochho ki TCP 443 par web request ke liye kaunsi rule decide karti hai. Yahi woh rule hai jis par aap profiles lagate:</p>
<pre class="out">admin@NK-PUNE-PA&gt; test security-policy-match from trust to untrust source 10.0.1.10 destination 8.8.8.8 protocol 6 destination-port 443
<span class="hl">"Allow-Out; index: 1" {</span>
        from trust;
        source any;
        source-region none;
        to untrust;
        destination any;
        destination-region none;
        category any;
        application/service [ ping dns web-browsing ssl ]/application-default;
<span class="hl">        action allow;</span>
        icmp-unreachable: no
        terminal yes;
}</pre>
<p>Line <code>action allow</code> inspection ki precondition hai. Asli request ke baad session detail batata hai ki firewall ne session kaise sambhala. Yeh lines simulator ke <code>show session id</code> se hain:</p>
<pre class="out">admin@NK-PUNE-PA&gt; show session id 9362
	layer7 packet count(c2s)             : 3
	layer7 packet count(s2c)             : 2
	application                          : web-browsing
	rule                                 : Allow-Out
	nat-rule                             : SNAT-Out(vsys1)
<span class="hl">	layer7 processing                    : enabled</span>
<span class="hl">	URL filtering enabled                : False</span>
	ingress interface                    : ethernet1/2
	egress interface                     : ethernet1/1
	session QoS rule                     : N/A (class 4)</pre>
<p>Do highlighted lines padho. <code>layer7 processing : enabled</code> ka matlab session App-ID ke under hai. <code>URL filtering enabled : False</code> kehta hai ki <b>is session par koi URL filtering profile lagu nahi hai</b>, kyunki simulator mein <code>Allow-Out</code> par profile nahi lagi. Asli firewall par jahan matching rule par URL filtering profile ho wahan yeh line True dikhati hai. "Kya mera profile is session par lag raha hai?" ka yeh sabse tez ek check hai.</p>
<h3>Alag-alag profiles ya profile group</h3>
<p>Rule har profile type ko alag se point kar sakti hai, ya ek <b>profile group</b> ko jo unhe bundle karta hai. Practice mein groups jeette hain kyunki aap group ek baar badalte ho aur use karne wali har rule follow karti hai. Configuration ka shape:</p>
<pre class="code"># Reference configuration (not run in the simulator)
set profile-group NK-Strict virus NK-AV vulnerability NK-VP url-filtering NK-URL wildfire-analysis NK-WF
set rulebase security rules Allow-Out profile-setting group NK-Strict</pre>
<p>Simulator mein doosri line <code>Invalid syntax</code> se reject hoti hai (pichhle chapter mein dikhaya), jo expected hai. Asli firewall par rules profile icon bhi dikhati hain, aur traffic logs record karte hain ki kaunsa profile group lagu hua.</p>
<h3>Teen jagah jahan inspection chupchaap gayab ho jaata hai</h3>
<ol><li><b>Galat rule.</b> Profiles ke bina pehle ki allow rule pehle match ho jaati hai. Yeh policy module ki rule-order samasya naye roop mein hai.</li><li><b>Encrypted traffic.</b> Decryption policy ke bina firewall TLS ke andar nahi dekh sakta. Antivirus, vulnerability aur WildFire ko payload chahiye; URL filtering categorisation ke liye server name abhi bhi use kar sakta hai. Decryption alag topic hai.</li><li><b>Purana content.</b> Profile maujood hai lekin signatures purane hain kyunki content updates schedule nahi hain ya subscription expire ho gayi.</li></ol>
<div class="warn"><p><b>Common mistake.</b> Yeh maan lena ki profile banane se woh enforce hota hai. Profile tab tak kuch nahi karta jab tak traffic allow karne wali rule use reference na kare.</p></div>
<div class="exam"><p><b>Exam trap.</b> Profiles us rule ke liye evaluate hote hain jise session ne match kiya. Do allow rules match kar sakti hon to sirf pehli decide karti hai, aur sirf uske profiles lagu hote hain.</p></div>
<div class="scn"><h4>Galat rule par group</h4><p>Security team ne profile group Allow-Web rule par lagaya, lekin finance subnet ka traffic uske upar ki purani rule Finance-Out se match hota tha jisme group nahi tha. Finance traffic mahino tak inspect hi nahi hua. Finance host ke liye <code>test security-policy-match</code> ne Finance-Out dikhaya; group us rule par bhi jodha gaya aur purani rule baad mein Allow-Web mein merge hui.</p><p><b>Lesson:</b> profiles ko us rule par lagao jo asal mein match hoti hai, aur test command se check karo.</p></div>
<div class="iv"><p class="q">"Rule par profile group lagaya hai lekin threat log nahi hua. Kya check karte ho?"</p><p>Pehle, session ne asal mein kaunsi rule match ki (test security-policy-match, session detail), phir kya woh allow rule hai jis par group lagaa hai, kya traffic encrypted tha aur decrypt nahi hua, aur kya content updates current aur subscription valid hain. Yeh bhi dekhta hoon ki profile action alert hai ya block aur log kahan forward hota hai.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Profile ko ek matching allow rule chahiye jo use reference kare.</li><li>Profile group use karo taaki ek change har rule update kare.</li><li><code>show session id</code> dikhata hai ki session par URL filtering lagu hai ya nahi.</li><li>Encryption, rule order aur purana content teen chupe gaps hain.</li></ul></div>
`}};export{e as default};