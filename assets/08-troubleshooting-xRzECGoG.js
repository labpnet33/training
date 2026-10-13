var e={id:`troubleshooting`,h:{en:`Troubleshooting IPsec: workflow, debug and common mismatches`,hi:`IPsec troubleshooting: workflow, debug aur common mismatches`},body:{en:`
<p>Tunnel troubleshooting is easy when you follow the layers and difficult when you guess. This chapter gives a fixed workflow, the typical cause behind each symptom, and the IKE debug commands that show the negotiation. The commands are real FortiOS commands, <b>not run in the simulator</b>. For sniffer and debug flow practice use <b>nse4-diag</b>; for the same ideas on other platforms see <b>sec-asa-vpn</b> and <b>sec-ftd-vpn</b>.</p>

<h3>The workflow</h3>
<ol>
<li><b>Is IKE reaching the peer?</b> Sniff for UDP 500 and 4500 to and from the peer. No packets out: wrong interface, route or a local policy. Packets out, none back: ISP filter, remote not listening, or wrong remote address.</li>
<li><b>Does phase 1 complete?</b> Check <code>diagnose vpn ike gateway list</code>. If not, read the IKE debug for proposal, authentication or version errors.</li>
<li><b>Does phase 2 complete?</b> Look at the tunnel list. If phase 1 is up but no SA, suspect selectors, phase 2 proposal or PFS.</li>
<li><b>Is traffic routed and allowed?</b> Check route lookup and policy, in both directions.</li>
<li><b>Do the counters move both ways?</b> If not, apply the counter logic from the last chapter.</li>
<li><b>Does the application work?</b> Think MTU, MSS, DNS and server firewalls.</li>
</ol>

<h3>The IKE debug, used carefully</h3>
<p>The debug shows each IKE message and the decision made. A safe sequence on a production device is:</p>
<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
diagnose vpn ike log filter clear
diagnose vpn ike log filter name to-BRANCH
diagnose debug application ike -1
diagnose debug console timestamp enable
diagnose debug enable
<span class="c"># ... reproduce: clear the gateway or send test traffic ...</span>
diagnose debug disable
diagnose debug reset</pre>
<p>The filter limits output to one tunnel, which matters on a busy hub. Always disable the debug when finished. Read the output from the first exchange: which side initiated, what proposals were offered, what was chosen or rejected, and the final error line.</p>

<h3>Symptoms, typical messages and causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Typical cause</th><th>Where you see it</th><th>Fix</th></tr>
<tr><td>No proposal chosen</td><td>Encryption, hash or DH group not in common</td><td>IKE debug on the responder</td><td>Align phase 1 proposals and DH group</td></tr>
<tr><td>Authentication failure, possible secret mismatch</td><td>Different PSK, trailing space, wrong certificate or peer ID</td><td>IKE debug mentions the key or the ID</td><td>Re-enter the PSK on both; check the IDs and certificates</td></tr>
<tr><td>Negotiation timeout, no reply</td><td>UDP 500 or 4500 blocked, wrong remote-gw, peer down</td><td>Sniffer shows packets out and none back</td><td>Fix path, filter or peer address</td></tr>
<tr><td>Phase 1 up, phase 2 fails</td><td>Selector or phase 2 proposal or PFS mismatch</td><td>Debug shows selector or proposal rejection</td><td>Mirror selectors; match PFS and DH</td></tr>
<tr><td>Both up, no traffic</td><td>No route or policy; return path missing</td><td>Counters and policy hit counts</td><td>Add route and policies both ways</td></tr>
<tr><td>Tunnel drops periodically</td><td>Lifetime mismatch, DPD too aggressive, unstable ISP</td><td>VPN event logs</td><td>Align lifetimes; tune DPD; add redundancy</td></tr>
<tr><td>Works for small packets only</td><td>MTU or MSS problem with ESP overhead</td><td>Pings pass, file transfers stall</td><td>Lower MSS on the policy or tunnel MTU</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Mismatch map">
<rect x="10" y="30" width="190" height="80" rx="10" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 1 mismatch</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">version, proposal, DH,</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">key, ID</text>
<rect x="225" y="30" width="190" height="80" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 2 mismatch</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">selectors, proposal,</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">PFS</text>
<rect x="440" y="30" width="190" height="80" rx="10" fill="#fed7aa"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="13">Not a VPN mismatch</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">route, policy, NAT,</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="12">MTU</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Identify which box the symptom lives in before changing anything</text>
</svg><p class="cap">Three boxes cover almost every tunnel ticket.</p></div>

<h3>Method: change one thing at a time</h3>
<p>Compare both configurations side by side first. Most mismatches can be found without any debug. Then change one setting, test, and note the result. If you must debug, set a filter, collect one clean negotiation, and read it from the top. Do not clear gateways repeatedly: each clear throws away the evidence and drops live traffic.</p>

<div class="eg"><p><b>Worked example.</b> A partner tunnel has never come up. The sniffer shows IKE out, IKE in, and then repeated retransmissions. The debug on the responder states that no proposal was chosen. HQ offers aes256gcm with DH 20; the partner supports aes256 with sha256 and DH 14 only. After a call, both agree on aes256-sha256 with DH 14 as a temporary standard, and plan an upgrade to GCM and DH 20 on the partner device.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Changing three settings at once. Debugging without a filter on a hub with hundreds of tunnels. Treating every failure as a PSK problem. Leaving the debug enabled and filling the console. Weakening crypto "just to make it work" and never restoring it.</p></div>
<div class="exam"><p><b>Exam trap.</b> A question shows an IKE debug excerpt. Identify which phase the error belongs to: proposal or key errors are phase 1; selector or proxy-ID errors are phase 2. Route and policy problems do not appear in the IKE debug at all.</p></div>

<div class="scn"><h4>A mismatch that took three hours and one line</h4><p>A new vendor-built branch could not form a tunnel. Engineers rotated through PSKs, certificates and DH groups. Finally someone put both configurations in two columns: one side had IKEv1 and the other IKEv2. The tunnel came up one minute after the version was aligned. The team adopted a rule: compare the configurations side by side before opening any debug.</p><p><b>Lesson:</b> read first, debug second.</p></div>

<div class="iv"><p class="q">"A site-to-site tunnel will not come up. How do you approach it?"</p><p>I split it by phase. I sniff for IKE on UDP 500 and 4500, check the IKE gateway list, compare both configurations for version, proposal, DH and key, and use a filtered IKE debug to read the exact error. If phase 1 is fine, I look at selectors and phase 2 proposal. If both phases are up, I move to route, policy and counters.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Work in order: reach, phase 1, phase 2, route, policy, counters, application.</li>
<li>Proposal, version, key and DH errors are phase 1; selector and PFS errors are phase 2.</li>
<li>Filter the IKE debug and always disable it afterwards.</li>
<li>Compare configurations side by side before debugging.</li>
<li>Do not weaken crypto to force a tunnel up.</li>
</ul></div>
`,hi:`
<p>Tunnel troubleshooting aasaan hai jab aap layers follow karte ho aur mushkil jab andaaza lagate ho. Yeh chapter fixed workflow, har symptom ke peeche typical cause, aur woh IKE debug commands deta hai jo negotiation dikhate hain. Commands asli FortiOS commands hain, <b>simulator mein nahi chalaye gaye</b>. Sniffer aur debug flow ki practice ke liye <b>nse4-diag</b> use karo; doosre platforms par wahi ideas ke liye <b>sec-asa-vpn</b> aur <b>sec-ftd-vpn</b> dekho.</p>

<h3>Workflow</h3>
<ol>
<li><b>Kya IKE peer tak pahunch raha hai?</b> Peer ke aane-jaane wale UDP 500 aur 4500 ke liye sniff karo. Koi packet out nahi: galat interface, route ya local policy. Packets out, wapas kuch nahi: ISP filter, remote sun nahi raha, ya galat remote address.</li>
<li><b>Kya phase 1 complete hota hai?</b> <code>diagnose vpn ike gateway list</code> check karo. Nahi hota to proposal, authentication ya version errors ke liye IKE debug padho.</li>
<li><b>Kya phase 2 complete hota hai?</b> Tunnel list dekho. Phase 1 up hai lekin SA nahi, to selectors, phase 2 proposal ya PFS par shak karo.</li>
<li><b>Kya traffic routed aur allowed hai?</b> Dono directions mein route lookup aur policy check karo.</li>
<li><b>Kya counters dono taraf chalte hain?</b> Nahi, to pichle chapter ka counter logic lagao.</li>
<li><b>Kya application chalti hai?</b> MTU, MSS, DNS aur server firewalls ke baare mein socho.</li>
</ol>

<h3>IKE debug, dhyaan se</h3>
<p>Debug har IKE message aur liya gaya decision dikhata hai. Production device par safe sequence yeh hai:</p>
<pre class="code"><span class="c"># Reference commands (not run in the simulator)</span>
diagnose vpn ike log filter clear
diagnose vpn ike log filter name to-BRANCH
diagnose debug application ike -1
diagnose debug console timestamp enable
diagnose debug enable
<span class="c"># ... reproduce: gateway clear karo ya test traffic bhejo ...</span>
diagnose debug disable
diagnose debug reset</pre>
<p>Filter output ko ek tunnel tak seemit karta hai, jo hundreds of tunnels wale busy hub par matter karta hai. Khatam hone par debug hamesha disable karo. Output pehle exchange se padho: kaunsi side ne initiate kiya, kaunse proposals offer hue, kya chuna ya reject hua, aur aakhri error line.</p>

<h3>Symptoms, typical messages aur causes</h3>
<table class="cmp"><tr><th>Symptom</th><th>Typical cause</th><th>Kahan dikhta hai</th><th>Fix</th></tr>
<tr><td>No proposal chosen</td><td>Encryption, hash ya DH group common nahi</td><td>Responder par IKE debug</td><td>Phase 1 proposals aur DH group align karo</td></tr>
<tr><td>Authentication failure, possible secret mismatch</td><td>Alag PSK, trailing space, galat certificate ya peer ID</td><td>IKE debug key ya ID ka zikr karta hai</td><td>Dono par PSK dobara daalo; IDs aur certificates check karo</td></tr>
<tr><td>Negotiation timeout, reply nahi</td><td>UDP 500 ya 4500 blocked, galat remote-gw, peer down</td><td>Sniffer mein packets out aur wapas koi nahi</td><td>Path, filter ya peer address theek karo</td></tr>
<tr><td>Phase 1 up, phase 2 fail</td><td>Selector ya phase 2 proposal ya PFS mismatch</td><td>Debug selector ya proposal rejection dikhata hai</td><td>Selectors mirror karo; PFS aur DH match karo</td></tr>
<tr><td>Dono up, traffic nahi</td><td>Route ya policy nahi; return path missing</td><td>Counters aur policy hit counts</td><td>Dono taraf route aur policies add karo</td></tr>
<tr><td>Tunnel kabhi-kabhi girta hai</td><td>Lifetime mismatch, DPD bahut aggressive, unstable ISP</td><td>VPN event logs</td><td>Lifetimes align karo; DPD tune karo; redundancy add karo</td></tr>
<tr><td>Sirf chhote packets chalte hain</td><td>ESP overhead ke saath MTU ya MSS problem</td><td>Pings pass, file transfers atakte hain</td><td>Policy par MSS ya tunnel MTU kam karo</td></tr></table>

<div class="dia"><svg viewBox="0 0 640 150" role="img" aria-label="Mismatch map">
<rect x="10" y="30" width="190" height="80" rx="10" fill="#bae6fd"/><text x="105" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 1 mismatch</text><text x="105" y="80" text-anchor="middle" class="svg-muted" font-size="12">version, proposal, DH,</text><text x="105" y="96" text-anchor="middle" class="svg-muted" font-size="12">key, ID</text>
<rect x="225" y="30" width="190" height="80" rx="10" fill="#fde68a"/><text x="320" y="58" text-anchor="middle" class="svg-ink" font-size="13">Phase 2 mismatch</text><text x="320" y="80" text-anchor="middle" class="svg-muted" font-size="12">selectors, proposal,</text><text x="320" y="96" text-anchor="middle" class="svg-muted" font-size="12">PFS</text>
<rect x="440" y="30" width="190" height="80" rx="10" fill="#fed7aa"/><text x="535" y="58" text-anchor="middle" class="svg-ink" font-size="13">VPN mismatch nahi</text><text x="535" y="80" text-anchor="middle" class="svg-muted" font-size="12">route, policy, NAT,</text><text x="535" y="96" text-anchor="middle" class="svg-muted" font-size="12">MTU</text>
<text x="320" y="135" text-anchor="middle" class="svg-muted" font-size="12">Kuch badalne se pehle pehchaano ki symptom kis box mein hai</text>
</svg><p class="cap">Teen boxes lagbhag har tunnel ticket cover karte hain.</p></div>

<h3>Method: ek baar mein ek cheez badlo</h3>
<p>Pehle dono configurations ko side by side compare karo. Zyadatar mismatches bina debug ke mil jaate hain. Phir ek setting badlo, test karo aur result note karo. Debug karna hi pade to filter set karo, ek saaf negotiation collect karo aur use upar se padho. Gateways baar-baar clear mat karo: har clear evidence mita deta hai aur live traffic girata hai.</p>

<div class="eg"><p><b>Worked example.</b> Ek partner tunnel kabhi up nahi hua. Sniffer IKE out, IKE in, aur phir baar-baar retransmissions dikhata hai. Responder ka debug batata hai ki koi proposal nahi chuna gaya. HQ DH 20 ke saath aes256gcm offer karta hai; partner sirf sha256 ke saath aes256 aur DH 14 support karta hai. Call ke baad dono temporary standard ke roop mein DH 14 ke saath aes256-sha256 par agree hote hain, aur partner device par GCM aur DH 20 upgrade plan karte hain.</p></div>

<div class="warn"><p><b>Common mistakes.</b> Ek saath teen settings badalna. Hundreds of tunnels wale hub par bina filter ke debug karna. Har failure ko PSK problem samajhna. Debug enabled chhodkar console bhar dena. "Bas chalane ke liye" crypto kamzor karna aur kabhi restore na karna.</p></div>
<div class="exam"><p><b>Exam trap.</b> Question IKE debug ka excerpt dikhata hai. Pehchaano ki error kis phase ki hai: proposal ya key errors phase 1 ke hain; selector ya proxy-ID errors phase 2 ke. Route aur policy problems IKE debug mein dikhti hi nahi.</p></div>

<div class="scn"><h4>Mismatch jisme teen ghante aur ek line lagi</h4><p>Vendor-built naya branch tunnel nahi bana paaya. Engineers PSKs, certificates aur DH groups ghumate rahe. Aakhir mein kisi ne dono configurations ko do columns mein rakha: ek side IKEv1 thi aur doosri IKEv2. Version align hone ke ek minute baad tunnel up ho gaya. Team ne rule banaya: koi bhi debug kholne se pehle configurations ko side by side compare karo.</p><p><b>Lesson:</b> pehle padho, phir debug karo.</p></div>

<div class="iv"><p class="q">"Site-to-site tunnel up nahi ho raha. Aap kaise approach karoge?"</p><p>Main ise phase se baant-ta hoon. Main UDP 500 aur 4500 par IKE ke liye sniff karta hoon, IKE gateway list check karta hoon, dono configurations ko version, proposal, DH aur key ke liye compare karta hoon, aur exact error padhne ke liye filtered IKE debug use karta hoon. Phase 1 theek ho to selectors aur phase 2 proposal dekhta hoon. Dono phases up hon to route, policy aur counters par jaata hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Kram se kaam karo: reach, phase 1, phase 2, route, policy, counters, application.</li>
<li>Proposal, version, key aur DH errors phase 1 ke hain; selector aur PFS errors phase 2 ke.</li>
<li>IKE debug filter karo aur baad mein hamesha disable karo.</li>
<li>Debug se pehle configurations side by side compare karo.</li>
<li>Tunnel up karne ke liye crypto kamzor mat karo.</li>
</ul></div>
`}};export{e as default};