var e={id:`order`,h:{en:`Rule order and first match`,hi:`Rule order aur first match`},body:{en:`
<p>In chapter one the guard read the register from the top. This chapter is about that one habit, because it explains most policy problems you will ever debug. The engine checks rules <b>from top to bottom</b> and stops at the <b>first rule that matches</b>. Rules below a match are never looked at for that connection.</p>

<h3>Analogy: the airport queue lanes</h3>
<p>At an airport, a sign says "Crew only", then "Families", then "Everyone". A passenger walks along the signs and joins the first lane that describes them. A pilot never reaches "Everyone". If the airport puts "Everyone: go to gate 9" at the top, no passenger ever sees the special lanes. A policy is the same: the order of the signs is the policy.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="First match wins">
<rect x="20" y="15" width="300" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="37" class="svg-ink" font-size="13">1  net-staff to srv-web HTTPS  Allow</text>
<rect x="20" y="55" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="77" class="svg-ink" font-size="13">2  net-staff to any DNS (UDP)  Allow</text>
<rect x="20" y="95" width="300" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="117" class="svg-ink" font-size="13">3  any to any any  Discard</text>
<rect x="20" y="135" width="300" height="34" rx="6" fill="#fed7aa"/><text x="30" y="157" class="svg-ink" font-size="13">Implicit discard (no row shown)</text>
<text x="350" y="77" class="svg-accent" font-size="13">STAFF-PC DNS query</text>
<line x1="345" y1="72" x2="325" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="350" y="40" class="svg-muted" font-size="12">row 1: service differs, skip</text>
<text x="350" y="105" class="svg-muted" font-size="12">row 3: never reached</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Matching stops at row 2 for this query</text>
</svg><p class="cap">The DNS query skips row 1, matches row 2 and stops. Rows 3 and the implicit discard are not evaluated.</p></div>

<h3>The implicit discard at the bottom</h3>
<p>If a connection matches no rule at all, the engine discards it. There is no visible row for this; it is built in. This is the safe default: anything you did not explicitly allow is blocked. It also means a brand-new policy with no rules blocks everything, which surprises beginners.</p>
<p>Because it is silent, a connection that reaches the implicit discard is logged against no rule number. If you see a drop in the logs with no rule, you are looking at the end of the list. The fix is a new Allow rule in the right place, not a change to the bottom.</p>

<h3>Specific above general</h3>
<p>The rule of thumb is simple. Put narrow rules first and broad rules after them. A narrow rule such as "block Telnet from the staff LAN" must sit above a broad rule such as "staff may go anywhere". If the broad rule comes first, the narrow rule is <b>shadowed</b>: it can never match. Chapter ten shows how the console warns you about this.</p>
<table class="cmp"><tr><th>Order</th><th>Rule</th><th>Result for Telnet from STAFF-PC</th></tr>
<tr><td>Good</td><td>1 Discard Telnet; 2 Allow staff any</td><td>Dropped at rule 1</td></tr>
<tr><td>Bad</td><td>1 Allow staff any; 2 Discard Telnet</td><td>Allowed at rule 1; rule 2 is dead</td></tr>
</table>

<h3>Disabled rules are skipped</h3>
<p>A rule can be switched off without deleting it. A disabled rule is skipped as if it were not in the list, and it does not count as a match. Admins disable rules to test or to keep a record. The danger is forgetting: a disabled Allow means the connection falls through to something below, often the implicit discard, and users complain that "the rule is there but it does not work".</p>

<div class="eg"><p><b>Worked example.</b> Policy for the Pune engine: rule 1 Allow net-staff to srv-web HTTPS (enabled); rule 2 Allow net-staff to any HTTPS (disabled); rule 3 Discard any to any any. STAFF-PC opens HTTPS to a site on the internet. Rule 1: destination differs, skip. Rule 2: disabled, skip. Rule 3: matches, Discard. The user sees a timeout. After the admin enables rule 2 and installs, the same request matches rule 2 and is allowed.</p></div>

<h3>Checking by reading</h3>
<p>For any connection you can walk the list by hand: write down source, destination and service, then check each enabled rule in turn. Chapter five shows how the Policy match test and counters do this for you and prove the answer.</p>
<pre class="out">Connection: 10.1.1.10 -&gt; 203.0.113.80 tcp/443
Rule 1  net-staff -&gt; srv-web  HTTPS      no (destination)
Rule 2  disabled                          skipped
<span class="hl">Rule 3  any -&gt; any  any  Discard      MATCH</span>
Result: Discard</pre>

<div class="warn"><p><b>Common mistake.</b> Adding a new Allow rule at the bottom, below a broad Discard. The new rule is correct but never reached. Place it above the Discard.</p></div>
<div class="exam"><p><b>Exam trap.</b> The implicit discard is at the very bottom and is not a rule you can reorder. Also, "first match" is about order of evaluation, not about which rule is "most specific": the engine does not pick the narrowest rule, it picks the first.</p></div>

<div class="scn"><h4>Nobody could reach the intranet page</h4><p>After a clean-up, the Pune policy had a broad Discard for the DMZ placed above an Allow for staff HTTPS to srv-web. Staff reported timeouts only to the DMZ; the internet worked. The admin read the list top down and saw that the Discard matched first. Moving the Allow above the Discard and installing fixed it. This is exactly the situation in lab fp-policy-3.</p><p><b>Lesson:</b> when a rule "never matches", read above it first.</p></div>
<div class="iv"><p class="q">"A user cannot reach a server although an Allow rule exists. What do you check?"</p><p>Check that the rule is enabled, that it is installed, and that no earlier rule (including template rules) matches first. Mention first-match and the implicit discard, and say you would confirm with the Policy match test.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The engine reads rules top to bottom and stops at the first match.</li>
<li>No match means implicit discard; a policy with no rules blocks everything.</li>
<li>Narrow rules go above broad ones, or they become shadowed.</li>
<li>Disabled rules are skipped; check the enabled state when a rule seems ignored.</li>
</ul></div>
`,hi:`
<p>Chapter one mein guard ne register ko upar se padha tha. Yeh chapter usi ek aadat ke baare mein hai, kyunki isi se zyadatar policy problems samajh aati hain. Engine rules ko <b>upar se neeche</b> check karta hai aur <b>pehle matching rule</b> par ruk jata hai. Match ke neeche ke rules us connection ke liye dekhe hi nahi jaate.</p>

<h3>Analogy: airport ki queue lanes</h3>
<p>Airport par sign hote hain: "Crew only", phir "Families", phir "Everyone". Passenger signs ke saath chalta hai aur pehli lane join karta hai jo use describe karti hai. Pilot kabhi "Everyone" tak nahi pahunchta. Agar airport "Everyone: gate 9 par jao" sabse upar laga de, to koi passenger special lanes dekhta hi nahi. Policy bhi waisi hi hai: signs ka order hi policy hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="First match jeetta hai">
<rect x="20" y="15" width="300" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="37" class="svg-ink" font-size="13">1  net-staff to srv-web HTTPS  Allow</text>
<rect x="20" y="55" width="300" height="34" rx="6" fill="#bbf7d0"/><text x="30" y="77" class="svg-ink" font-size="13">2  net-staff to any DNS (UDP)  Allow</text>
<rect x="20" y="95" width="300" height="34" rx="6" fill="#e2e8f0"/><text x="30" y="117" class="svg-ink" font-size="13">3  any to any any  Discard</text>
<rect x="20" y="135" width="300" height="34" rx="6" fill="#fed7aa"/><text x="30" y="157" class="svg-ink" font-size="13">Implicit discard (row dikhti nahi)</text>
<text x="350" y="77" class="svg-accent" font-size="13">STAFF-PC DNS query</text>
<line x1="345" y1="72" x2="325" y2="72" stroke="#64748b" stroke-width="2"/>
<text x="350" y="40" class="svg-muted" font-size="12">row 1: service alag, skip</text>
<text x="350" y="105" class="svg-muted" font-size="12">row 3: kabhi nahi pahunchte</text>
<text x="320" y="205" text-anchor="middle" class="svg-muted" font-size="12">Is query ke liye matching row 2 par ruk jati hai</text>
</svg><p class="cap">DNS query row 1 skip karti hai, row 2 match karti hai aur ruk jati hai. Row 3 aur implicit discard evaluate nahi hote.</p></div>

<h3>Neeche ka implicit discard</h3>
<p>Agar koi connection kisi bhi rule se match nahi karti, to engine use discard kar deta hai. Iske liye koi visible row nahi hoti; yeh built-in hai. Yeh safe default hai: jo aapne explicitly allow nahi kiya woh block hai. Iska matlab yeh bhi hai ki bina rules ki nayi policy sab kuch block kar deti hai, jo beginners ko surprise karta hai.</p>
<p>Kyunki yeh silent hai, implicit discard tak pahunchi connection kisi rule number ke against log nahi hoti. Agar logs mein bina rule ke drop dikhe, to aap list ke end par ho. Fix sahi jagah par naya Allow rule hai, bottom ko badalna nahi.</p>

<h3>Specific upar, general neeche</h3>
<p>Rule of thumb simple hai. Narrow rules pehle, broad rules unke baad. "Staff LAN se Telnet block karo" jaisa narrow rule "staff kahin bhi ja sakta hai" jaise broad rule ke upar hona chahiye. Agar broad rule pehle aaya, to narrow rule <b>shadowed</b> ho jata hai: woh kabhi match nahi kar sakta. Chapter ten dikhata hai ki console iske baare mein warning kaise deta hai.</p>
<table class="cmp"><tr><th>Order</th><th>Rule</th><th>STAFF-PC se Telnet ka result</th></tr>
<tr><td>Sahi</td><td>1 Discard Telnet; 2 Allow staff any</td><td>Rule 1 par drop</td></tr>
<tr><td>Galat</td><td>1 Allow staff any; 2 Discard Telnet</td><td>Rule 1 par allow; rule 2 dead hai</td></tr>
</table>

<h3>Disabled rules skip hote hain</h3>
<p>Rule ko delete kiye bina off kiya ja sakta hai. Disabled rule skip hota hai jaise woh list mein hai hi nahi, aur woh match nahi gina jata. Admins test karne ya record rakhne ke liye rules disable karte hain. Khatra bhoolna hai: disabled Allow ka matlab connection neeche chali jati hai, aksar implicit discard tak, aur users kehte hain "rule hai par kaam nahi karta".</p>

<div class="eg"><p><b>Worked example.</b> Pune engine ki policy: rule 1 Allow net-staff to srv-web HTTPS (enabled); rule 2 Allow net-staff to any HTTPS (disabled); rule 3 Discard any to any any. STAFF-PC internet ki site par HTTPS kholta hai. Rule 1: destination alag, skip. Rule 2: disabled, skip. Rule 3: match, Discard. User ko timeout dikhta hai. Admin rule 2 enable karke install karta hai to wahi request rule 2 se match hoti hai aur allow ho jati hai.</p></div>

<h3>Padh kar check karna</h3>
<p>Kisi bhi connection ke liye aap list haath se chal sakte ho: source, destination aur service likho, phir har enabled rule ko order mein check karo. Chapter five dikhata hai ki Policy match test aur counters yeh aapke liye karte hain aur jawab prove karte hain.</p>
<pre class="out">Connection: 10.1.1.10 -&gt; 203.0.113.80 tcp/443
Rule 1  net-staff -&gt; srv-web  HTTPS      no (destination)
Rule 2  disabled                          skipped
<span class="hl">Rule 3  any -&gt; any  any  Discard      MATCH</span>
Result: Discard</pre>

<div class="warn"><p><b>Common mistake.</b> Naya Allow rule bottom mein, broad Discard ke neeche, add karna. Naya rule sahi hai par kabhi reach nahi hota. Use Discard ke upar rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Implicit discard bilkul bottom par hai aur aisa rule nahi hai jise aap reorder kar sako. Aur "first match" evaluation order ke baare mein hai, "most specific" ke baare mein nahi: engine sabse narrow rule nahi chunta, woh pehla chunta hai.</p></div>

<div class="scn"><h4>Intranet page koi nahi khol paaya</h4><p>Clean-up ke baad Pune policy mein DMZ ka broad Discard, staff HTTPS to srv-web ke Allow ke upar aa gaya tha. Staff ne sirf DMZ ke timeouts report kiye; internet chal raha tha. Admin ne list upar se neeche padhi aur dekha ki Discard pehle match hota hai. Allow ko Discard ke upar le jaakar install karne se fix ho gaya. Lab fp-policy-3 mein yahi situation hai.</p><p><b>Lesson:</b> jab rule "kabhi match nahi karta", pehle uske upar padho.</p></div>
<div class="iv"><p class="q">"User server tak nahi pahunch pa raha jabki Allow rule hai. Kya check karoge?"</p><p>Check karo ki rule enabled hai, installed hai, aur koi pehle ka rule (template rules samet) pehle match nahi karta. First-match aur implicit discard mention karo, aur bolo ki Policy match test se confirm karoge.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Engine rules ko upar se neeche padhta hai aur pehli match par ruk jata hai.</li>
<li>No match ka matlab implicit discard; bina rules ki policy sab block karti hai.</li>
<li>Narrow rules broad rules ke upar jaate hain, warna shadowed ho jaate hain.</li>
<li>Disabled rules skip hote hain; rule ignore ho raha lage to enabled state check karo.</li>
</ul></div>
`}};export{e as default};