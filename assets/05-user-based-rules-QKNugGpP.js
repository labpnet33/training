var e={id:`user-based-rules`,h:{en:`User-based security rules and identity in logs`,hi:`User-based security rules aur logs mein identity`},body:{en:`

<p><b>Now use identity.</b> With mappings and groups in place, you can finally write rules about people. This chapter shows how the source user field works, how to combine it with applications, and what happens to traffic whose user is not known.</p>

<h3>Analogy: the lab door that opens for the Engineers badge</h3>
<p>The lab door reads the badge colour. Engineers go in, everyone else is turned away, and the entry log names who came. A rule with a user condition is that door: "from trust to untrust, user group engineers, application web-browsing, allow".</p>

<h3>The source user field</h3>
<p>A security rule has a <b>Source User</b> field. It accepts:</p>
<table class="cmp"><tr><th>Value</th><th>Matches</th></tr>
<tr><td>any</td><td>All traffic, with or without a known user (the default)</td></tr>
<tr><td>known-user</td><td>Any user the firewall has a mapping for</td></tr>
<tr><td>unknown</td><td>Traffic whose user is not known</td></tr>
<tr><td>pre-logon</td><td>GlobalProtect clients connected before user login (see chapter 6)</td></tr>
<tr><td>A user or group</td><td>Only traffic from that user or members of that group</td></tr>
</table>
<p>The rule still needs zones, applications and an action. The user is one more condition, and <b>all conditions must match</b>.</p>

<h3>Writing the rule in the simulator</h3>
<p>The simulator accepts the <code>source-user</code> field and stores it, so you can practise the syntax. Notice the order of rules: the user-specific rule is moved <b>before</b> the general one, because the first matching rule wins. Real simulator output:</p>
<pre class="out">PA1# set rulebase security rules Eng-Web from trust to untrust source any destination any source-user acme.example\\engineers application web-browsing service application-default action allow
PA1# set rulebase security rules Eng-Web application ssl
PA1# move rulebase security rules Eng-Web before Allow-Out
PA1# commit

Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<p>The configuration read back shows the rule with the user condition:</p>
<pre class="out">      Eng-Web {
        from trust;
        to untrust;
        source any;
        destination any;
        <span class="hl">source-user acme.example\\engineers;</span>
        application [ web-browsing ssl ];
        service application-default;
        action allow;
      }
      Allow-Out {
        from trust;
        to untrust;
        ...</pre>
<p>This is a <b>simulator limitation to be aware of</b>: the simulator keeps the field in the configuration, but it does not evaluate identities, so every session still shows <code>src user: unknown</code> and the rule matches regardless of user. Its <code>show running security-policy</code> prints <code>user any</code> for every rule. On a real firewall the user in the running policy is the one you set and only mapped users match.</p>

<h3>Design pattern: user plus application</h3>
<p>Users alone are not enough. The strongest rules combine <b>who</b> and <b>what</b>:</p>
<pre class="code"><span class="c">! Reference pattern: engineers may use SSH to the build servers</span>
<span class="c">! Engineers group, application ssh, destination build-servers</span>
set rulebase security rules Eng-SSH from trust to dmz source any destination BUILD-SERVERS source-user acme.example\\engineers application ssh service application-default action allow</pre>
<p>Anyone outside the Engineers group matches no rule here and falls to a later rule, or the default deny. Combine with security profiles (pan-profiles) for threat checks.</p>

<h3>What about unknown users?</h3>
<p>A user rule never matches when the user is unknown. That is intentional, but it needs a plan:</p>
<ul>
<li>Put a rule for <code>known-user</code> that allows the normal business traffic, and a rule for <code>unknown</code> that permits only what guests need, or redirects to authentication.</li>
<li>Use <b>Authentication Policy</b> with a captive portal so that unknown users log in on the first web request and then match the user rule.</li>
<li>Do not "fix" unknown traffic by changing the rule to <code>any</code>; that removes the identity control you wanted.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Marketing may use social media during lunch, engineers may not. The team writes: rule 10, from trust to untrust, source-user the Marketing group, URL category social-networking, allow. Rule 20: same zones, source-user known-user, application web-browsing and ssl, URL category social-networking, deny. Marketing matches rule 10 first. Other known users hit the deny. Unknown users match neither and are handled by the final rule.</p></div>

<h3>Identity in logs and sessions</h3>
<p>Once mappings work, the <code>SrcUser</code> column of the traffic log and the <code>src user</code> line of the session detail show the user. In the lab both are empty or unknown, because no identity source exists. Compare:</p>
<pre class="out">Lab today (no identity source):
		<span class="hl">src user:    unknown</span>

Production with User-ID would show a mapped name here, for example:
		src user:    acme.example\\priya.s</pre>
<p>The second block is an illustration of the format only; it is not simulator output.</p>

<h3>Destination user and other uses</h3>
<p>Identity also feeds reports (top users by application), log forwarding filters, and the Authentication policy. The destination user is rarely used in rules; remember that user conditions apply to the <b>source</b>.</p>

<div class="warn"><p><b>Common mistake.</b> Placing a general allow rule above the user rule. The first match wins, so the general rule shadows the specific one and the user condition is never reached. Put specific user rules first.</p></div>
<div class="exam"><p><b>Exam trap.</b> Source User values: any, known-user, unknown, pre-logon, or specific user and group. A rule with a user condition does not match traffic whose user is unknown. User-ID must be enabled on the source zone.</p></div>

<div class="scn"><h4>Contractors who could reach everything</h4><p>A rule for employees used source any because the team feared unknown users would be blocked. Contractors on guest Wi-Fi were therefore treated like staff. The team changed it to known-user plus the Employees group, added a captive portal for unknown users, and contractors were limited to the internet.</p><p><b>Lesson:</b> Using any for convenience gives away the benefit of identity. Plan for unknown users instead.</p></div>

<div class="iv"><p class="q">"How do you write a rule that only allows the finance team to reach a database application?"</p><p>I add the Finance group in the source user field, set the source zone, the destination and the application, and place the rule above any general rule. User-ID has to be enabled on the source zone and the group mapping must include the Finance group. I check src user in a session and test with a known finance user.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source user accepts any, known-user, unknown, pre-logon, a user or a group.</li>
<li>A user rule needs a mapping; unknown users do not match it.</li>
<li>Put specific user rules above general rules; first match wins.</li>
<li>Combine user with application and zones for tight rules.</li>
<li>The simulator stores source-user but does not evaluate identity.</li>
</ul></div>

`,hi:`

<p><b>Ab identity use karo.</b> Mappings aur groups ke baad aap aakhirkar logon ke baare mein rules likh sakte ho. Yeh chapter dikhata hai ki source user field kaise kaam karti hai, ise applications ke saath kaise milate hain, aur jis traffic ka user pata nahi uska kya hota hai.</p>

<h3>Analogy: lab ka darwaza jo Engineers badge par khulta hai</h3>
<p>Lab ka darwaza badge ka rang padhta hai. Engineers andar jaate hain, baaki wapas, aur entry log mein naam hota hai. User condition waali rule wahi darwaza hai: "trust se untrust, user group engineers, application web-browsing, allow".</p>

<h3>Source user field</h3>
<p>Security rule mein ek <b>Source User</b> field hoti hai. Yeh leti hai:</p>
<table class="cmp"><tr><th>Value</th><th>Kise match karta hai</th></tr>
<tr><td>any</td><td>Saara traffic, user pata ho ya nahi (default)</td></tr>
<tr><td>known-user</td><td>Koi bhi user jiska firewall ke paas mapping hai</td></tr>
<tr><td>unknown</td><td>Jis traffic ka user pata nahi</td></tr>
<tr><td>pre-logon</td><td>User login se pehle connect hue GlobalProtect clients (chapter 6 dekho)</td></tr>
<tr><td>Koi user ya group</td><td>Sirf us user ya group ke members ka traffic</td></tr>
</table>
<p>Rule ko phir bhi zones, applications aur action chahiye. User ek aur condition hai, aur <b>saari conditions match honi chahiye</b>.</p>

<h3>Simulator mein rule likhna</h3>
<p>Simulator <code>source-user</code> field accept karke store karta hai, isliye syntax practise kar sakte ho. Rules ka order dekho: user-specific rule general rule se <b>pehle</b> move hoti hai, kyunki pehli matching rule jeetti hai. Asli simulator output:</p>
<pre class="out">PA1# set rulebase security rules Eng-Web from trust to untrust source any destination any source-user acme.example\\engineers application web-browsing service application-default action allow
PA1# set rulebase security rules Eng-Web application ssl
PA1# move rulebase security rules Eng-Web before Allow-Out
PA1# commit

Commit job 4 is in progress. Use Ctrl+C to return to command prompt
......55%......75%.....98%.......100%
Configuration committed successfully</pre>
<p>Configuration wapas padhne par user condition waali rule dikhti hai:</p>
<pre class="out">      Eng-Web {
        from trust;
        to untrust;
        source any;
        destination any;
        <span class="hl">source-user acme.example\\engineers;</span>
        application [ web-browsing ssl ];
        service application-default;
        action allow;
      }
      Allow-Out {
        from trust;
        to untrust;
        ...</pre>
<p>Yeh <b>simulator ki limitation</b> hai jisse aapko aware rehna hai: simulator field ko configuration mein rakhta hai, lekin identities evaluate nahi karta, isliye har session mein <code>src user: unknown</code> dikhta hai aur rule user ki parwah kiye bina match hoti hai. Uska <code>show running security-policy</code> har rule ke liye <code>user any</code> print karta hai. Real firewall par running policy mein wahi user dikhta hai jo aapne set kiya aur sirf mapped users match karte hain.</p>

<h3>Design pattern: user plus application</h3>
<p>Sirf users kaafi nahi. Sabse majboot rules <b>kaun</b> aur <b>kya</b> ko milati hain:</p>
<pre class="code"><span class="c">! Reference pattern: engineers build servers par SSH use kar sakte hain</span>
<span class="c">! Engineers group, application ssh, destination build-servers</span>
set rulebase security rules Eng-SSH from trust to dmz source any destination BUILD-SERVERS source-user acme.example\\engineers application ssh service application-default action allow</pre>
<p>Engineers group ke bahar ka koi bhi yahan koi rule match nahi karta aur aage ki rule ya default deny par girta hai. Threat checks ke liye security profiles (pan-profiles) ke saath milao.</p>

<h3>Unknown users ka kya?</h3>
<p>Jab user unknown ho to user rule kabhi match nahi karti. Yeh jaanbujhkar hai, lekin iske liye plan chahiye:</p>
<ul>
<li><code>known-user</code> ke liye rule rakho jo normal business traffic allow kare, aur <code>unknown</code> ke liye rule jo sirf wahi permit kare jo guests ko chahiye, ya authentication par redirect kare.</li>
<li>Captive portal ke saath <b>Authentication Policy</b> use karo taaki unknown user pehli web request par login kare aur phir user rule match kare.</li>
<li>Unknown traffic ko rule <code>any</code> karke "fix" mat karo; isse woh identity control hat jaata hai jo aap chahte the.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Marketing lunch mein social media use kar sakti hai, engineers nahi. Team likhti hai: rule 10, trust se untrust, source-user Marketing group, URL category social-networking, allow. Rule 20: wahi zones, source-user known-user, application web-browsing aur ssl, URL category social-networking, deny. Marketing pehle rule 10 match karti hai. Doosre known users deny par aate hain. Unknown users dono match nahi karte aur aakhri rule sambhalti hai.</p></div>

<h3>Logs aur sessions mein identity</h3>
<p>Mappings chalne par traffic log ka <code>SrcUser</code> column aur session detail ki <code>src user</code> line user dikhati hai. Lab mein dono khaali ya unknown hain, kyunki koi identity source nahi. Compare karo:</p>
<pre class="out">Aaj lab mein (koi identity source nahi):
		<span class="hl">src user:    unknown</span>

User-ID ke saath production mein yahan mapped naam dikhta, jaise:
		src user:    acme.example\\priya.s</pre>
<p>Doosra block sirf format ka illustration hai; yeh simulator output nahi hai.</p>

<h3>Destination user aur doosre use</h3>
<p>Identity reports (application ke hisaab se top users), log forwarding filters aur Authentication policy ko bhi khilaati hai. Destination user rules mein kam use hota hai; yaad rakho user conditions <b>source</b> par lagti hain.</p>

<div class="warn"><p><b>Common mistake.</b> General allow rule ko user rule ke upar rakhna. Pehli match jeetti hai, isliye general rule specific ko shadow kar deti hai aur user condition tak baat pahunchti hi nahi. Specific user rules pehle rakho.</p></div>
<div class="exam"><p><b>Exam trap.</b> Source User values: any, known-user, unknown, pre-logon, ya specific user aur group. User condition waali rule us traffic ko match nahi karti jiska user unknown hai. Source zone par User-ID enable hona chahiye.</p></div>

<div class="scn"><h4>Contractors jo sab kuch pa sakte the</h4><p>Employees ki rule ne source any use kiya kyunki team ko darr tha ki unknown users block ho jaayenge. Isliye guest Wi-Fi ke contractors staff jaise treat hue. Team ne use known-user plus Employees group kiya, unknown users ke liye captive portal lagaya, aur contractors sirf internet tak simit ho gaye.</p><p><b>Lesson:</b> Convenience ke liye any use karna identity ka fayda de deta hai. Isse bachne ke liye unknown users ka plan banao.</p></div>

<div class="iv"><p class="q">"Aisi rule kaise likhoge jo sirf finance team ko database application tak pahunchne de?"</p><p>Source user field mein Finance group daalta hoon, source zone, destination aur application set karta hoon, aur rule ko kisi bhi general rule ke upar rakhta hoon. Source zone par User-ID enabled hona chahiye aur group mapping mein Finance group include hona chahiye. Session mein src user check karta hoon aur known finance user se test karta hoon.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Source user leta hai any, known-user, unknown, pre-logon, user ya group.</li>
<li>User rule ko mapping chahiye; unknown users uska match nahi karte.</li>
<li>Specific user rules general se upar rakho; pehli match jeetti hai.</li>
<li>Tight rules ke liye user ko application aur zones ke saath milao.</li>
<li>Simulator source-user store karta hai lekin identity evaluate nahi karta.</li>
</ul></div>

`}};export{e as default};