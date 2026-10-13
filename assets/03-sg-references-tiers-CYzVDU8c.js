var e=`<div class="dia"><svg viewBox="0 0 640 270" role="img" aria-label="Three-tier application with group-to-group security group rules">
<rect x="10" y="100" width="90" height="40" rx="20" fill="#e2e8f0"/><text x="55" y="125" text-anchor="middle" class="svg-ink" font-size="13">Internet</text>
<rect x="130" y="40" width="140" height="170" rx="8" fill="#bbf7d0"/><text x="200" y="62" text-anchor="middle" class="svg-ink" font-size="12">web-sn 10.60.1.0/24</text>
<rect x="145" y="85" width="110" height="60" rx="6" fill="#fff" stroke="#16a34a" stroke-width="3"/><text x="200" y="108" text-anchor="middle" class="svg-ink" font-size="12">web-1</text><text x="200" y="127" text-anchor="middle" class="svg-muted" font-size="11">web-sg</text>
<rect x="290" y="40" width="140" height="170" rx="8" fill="#fed7aa"/><text x="360" y="62" text-anchor="middle" class="svg-ink" font-size="12">app-sn 10.60.2.0/24</text>
<rect x="305" y="85" width="110" height="60" rx="6" fill="#fff" stroke="#16a34a" stroke-width="3"/><text x="360" y="108" text-anchor="middle" class="svg-ink" font-size="12">app-1</text><text x="360" y="127" text-anchor="middle" class="svg-muted" font-size="11">app-sg</text>
<rect x="450" y="40" width="140" height="170" rx="8" fill="#fecaca"/><text x="520" y="62" text-anchor="middle" class="svg-ink" font-size="12">db-sn 10.60.3.0/24</text>
<rect x="465" y="85" width="110" height="60" rx="6" fill="#fff" stroke="#16a34a" stroke-width="3"/><text x="520" y="108" text-anchor="middle" class="svg-ink" font-size="12">db-1</text><text x="520" y="127" text-anchor="middle" class="svg-muted" font-size="11">db-sg</text>
<line x1="100" y1="120" x2="145" y2="115" stroke="#64748b" stroke-width="3"/>
<line x1="255" y1="115" x2="305" y2="115" stroke="#2563eb" stroke-width="3"/>
<line x1="415" y1="115" x2="465" y2="115" stroke="#2563eb" stroke-width="3"/>
<text x="200" y="235" text-anchor="middle" class="svg-accent" font-size="11">80, 443 from 0.0.0.0/0</text>
<text x="360" y="235" text-anchor="middle" class="svg-accent" font-size="11">8080 from web-sg</text>
<text x="520" y="235" text-anchor="middle" class="svg-accent" font-size="11">5432 from app-sg</text>
<text x="320" y="260" text-anchor="middle" class="svg-muted" font-size="12">Each tier trusts the group of the tier in front of it, not an IP range.</text>
</svg><p class="cap">Group-to-group rules: db-sg allows port 5432 only from instances that carry app-sg.</p></div>`,t={id:`sg-references-tiers`,h:{en:`Group-to-group rules: a three-tier design that survives IP changes`,hi:`Group-to-group rules: three-tier design jo IP badalne par bhi chalta hai`},body:{en:`
<h3>The problem with IP ranges</h3>
<p>Suppose the database should accept connections only from the application servers. You could write a rule that allows port 5432 from <code>10.60.2.0/24</code>, the app subnet. It works, but it is loose: <i>every</i> resource in that subnet is trusted, including a test box someone launched there last week. And if the app tier moves to another subnet or grows into a second one, you must edit the rule.</p>

<h3>The better pattern: a security group as the source</h3>
<p>A rule's source can be <b>another security group</b>. The database group says: "allow TCP 5432 from <code>app-sg</code>". Now the trusted set is not a range of addresses but "whatever carries the app-sg label". Launch ten new app servers anywhere in the VPC with that group and they are trusted instantly; an unlabelled box in the same subnet is not. This is the standard way to build tiers.</p>

`+e+`

<h3>The three groups</h3>
<table class="cmp">
<tr><th>Group</th><th>Inbound rule</th><th>Why</th></tr>
<tr><td><code>web-sg</code></td><td>TCP 80 and 443 from 0.0.0.0/0</td><td>The web tier is the public front door.</td></tr>
<tr><td><code>app-sg</code></td><td>TCP 8080 from <code>web-sg</code></td><td>Only web servers may call the application.</td></tr>
<tr><td><code>db-sg</code></td><td>TCP 5432 from <code>app-sg</code></td><td>Only application servers may reach the database.</td></tr>
</table>
<p>Because groups are stateful, no outbound rule is needed for the replies. A web server that needs to reach the database directly is blocked: <code>db-sg</code> only trusts <code>app-sg</code>, and the web server does not carry that label. That is exactly the point.</p>

<h3>Building it from the CLI</h3>
<pre class="code">WEBSG=$(aws ec2 create-security-group --group-name web-sg --description "web tier" --vpc-id $VPC --query GroupId --output text)
APPSG=$(aws ec2 create-security-group --group-name app-sg --description "app tier" --vpc-id $VPC --query GroupId --output text)
DBSG=$(aws ec2 create-security-group --group-name db-sg --description "db tier" --vpc-id $VPC --query GroupId --output text)

aws ec2 authorize-security-group-ingress --group-id $WEBSG --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $APPSG --protocol tcp --port 8080 --source-group $WEBSG
aws ec2 authorize-security-group-ingress --group-id $DBSG --protocol tcp --port 5432 --source-group $APPSG</pre>
<p>Check how the reference is stored:</p>
<pre class="code">aws ec2 describe-security-group-rules --filters Name=group-id,Values=$DBSG --query 'SecurityGroupRules[?IsEgress==\`false\`].[FromPort,ToPort,ReferencedGroupInfo.GroupId]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
5432    5432    <span class="hl">sg-0aaa1111bbbb2222c</span></pre>
<p>The source column is a group ID, not an address. The group order matters when you script this: you must create <code>web-sg</code> before you can reference it from <code>app-sg</code>.</p>

<h3>Details worth knowing</h3>
<ul>
<li>A rule that references a security group matches traffic arriving from the <b>private IP addresses</b> of interfaces that use that group. It does not copy the other group's rules into this one.</li>
<li>A group can reference <b>itself</b>, which is how members of a cluster talk to each other while nobody else can.</li>
<li>Security groups can also be referenced across a VPC peering connection in some cases; check the peering documentation for the current conditions.</li>
<li>Tighten outbound too, when you can. For example the database group may need no outbound rule beyond replies, which are automatic.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Using <code>0.0.0.0/0</code> for the database "just to test" and forgetting to remove it. Before leaving a lab, list every rule whose source is <code>0.0.0.0/0</code> and justify each one.</p></div>

<div class="exam"><p><b>Exam trap.</b> "How do you allow only the web tier to talk to the app tier, even when instances are replaced by Auto Scaling?" Answer: reference the web tier's security group as the source in the app tier's group, not an IP range.</p></div>

<div class="scn"><h4>The Auto Scaling surprise</h4><p>A shop allowed its database from the fixed range of the app subnet. After a rebuild, the app servers were placed in a new subnet and every connection failed at 09:00 on a sale day. The fix was a one-line rule change, but the lesson was bigger: they rewrote the database group to trust <code>app-sg</code>, and later subnet moves became non-events.</p><p><b>Lesson:</b> trust identities (groups), not locations (ranges).</p></div>

<div class="iv"><p class="q">"How would you secure a three-tier application with security groups?"</p><p>One group per tier. Web allows 80 and 443 from the internet; app allows its port from the web group; database allows its port from the app group. No tier accepts traffic from anywhere it does not need. Mention that references survive instance replacement and subnet moves.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>A security group can be the source of another group's rule.</li>
<li>Group references trust a label, not a range, so they survive scaling and subnet moves.</li>
<li>Typical chain: internet to web-sg to app-sg to db-sg.</li>
<li>Create the referenced group first when scripting.</li>
</ul></div>
`,hi:`
<h3>IP ranges ki problem</h3>
<p>Maan lo database sirf application servers se connections accept kare. Aap aisa rule likh sakte ho jo app subnet <code>10.60.2.0/24</code> se port 5432 allow kare. Chalta hai, par dheela hai: us subnet ka <i>har</i> resource trusted ho jaata hai, pichhle hafte kisi ka launch kiya test box bhi. Aur app tier doosre subnet mein chala jaye ya ek aur subnet tak badh jaye, to rule edit karna padta hai.</p>

<h3>Behtar pattern: security group ko source banana</h3>
<p>Rule ka source <b>doosra security group</b> ho sakta hai. Database group kehta hai: "<code>app-sg</code> se TCP 5432 allow". Ab trusted set addresses ki range nahi, balki "jis par app-sg ka label ho woh" hai. VPC mein kahin bhi us group ke saath das naye app servers launch karo to turant trusted; usi subnet ka bina label wala box nahi. Tiers banane ka standard tarika yehi hai.</p>

`+e+`

<h3>Teen groups</h3>
<table class="cmp">
<tr><th>Group</th><th>Inbound rule</th><th>Kyun</th></tr>
<tr><td><code>web-sg</code></td><td>0.0.0.0/0 se TCP 80 aur 443</td><td>Web tier public front door hai.</td></tr>
<tr><td><code>app-sg</code></td><td><code>web-sg</code> se TCP 8080</td><td>Sirf web servers application ko call kar sakte hain.</td></tr>
<tr><td><code>db-sg</code></td><td><code>app-sg</code> se TCP 5432</td><td>Sirf application servers database tak pahunch sakte hain.</td></tr>
</table>
<p>Groups stateful hain, isliye replies ke liye outbound rule nahi chahiye. Jo web server seedha database tak pahunchna chahe woh block hota hai: <code>db-sg</code> sirf <code>app-sg</code> par bharosa karta hai, aur web server ke paas woh label nahi. Yahi poora maksad hai.</p>

<h3>CLI se banana</h3>
<pre class="code">WEBSG=$(aws ec2 create-security-group --group-name web-sg --description "web tier" --vpc-id $VPC --query GroupId --output text)
APPSG=$(aws ec2 create-security-group --group-name app-sg --description "app tier" --vpc-id $VPC --query GroupId --output text)
DBSG=$(aws ec2 create-security-group --group-name db-sg --description "db tier" --vpc-id $VPC --query GroupId --output text)

aws ec2 authorize-security-group-ingress --group-id $WEBSG --protocol tcp --port 443 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $APPSG --protocol tcp --port 8080 --source-group $WEBSG
aws ec2 authorize-security-group-ingress --group-id $DBSG --protocol tcp --port 5432 --source-group $APPSG</pre>
<p>Dekho reference kaise store hota hai:</p>
<pre class="code">aws ec2 describe-security-group-rules --filters Name=group-id,Values=$DBSG --query 'SecurityGroupRules[?IsEgress==\`false\`].[FromPort,ToPort,ReferencedGroupInfo.GroupId]' --output text</pre>
<pre class="out"><span class="c"># Illustrative output</span>
5432    5432    <span class="hl">sg-0aaa1111bbbb2222c</span></pre>
<p>Source column group ID hai, address nahi. Script karte waqt order matter karta hai: <code>app-sg</code> se reference karne se pehle <code>web-sg</code> banana padta hai.</p>

<h3>Jaanne layak details</h3>
<ul>
<li>Security group ko reference karne wala rule us group use karne wale interfaces ke <b>private IP addresses</b> se aane wale traffic ko match karta hai. Yeh doosre group ke rules is group mein copy nahi karta.</li>
<li>Group apne aap ko bhi <b>reference</b> kar sakta hai; cluster ke members aapas mein baat kar paate hain aur koi aur nahi.</li>
<li>Kuch cases mein security groups VPC peering connection ke across bhi reference ho sakte hain; current conditions ke liye peering documentation dekho.</li>
<li>Jahan ho sake outbound bhi tight karo. Jaise database group ko replies ke alawa koi outbound rule shayad na chahiye, aur replies automatic hain.</li>
</ul>

<div class="warn"><p><b>Common mistake.</b> Database ke liye "bas test ke liye" <code>0.0.0.0/0</code> lagana aur hatana bhool jaana. Lab chhodne se pehle <code>0.0.0.0/0</code> source wale har rule ki list banao aur har ek ka jawaz do.</p></div>

<div class="exam"><p><b>Exam trap.</b> "Instances Auto Scaling se replace hon tab bhi sirf web tier ko app tier se baat karne kaise do?" Jawab: app tier ke group mein web tier ka security group source banao, IP range nahi.</p></div>

<div class="scn"><h4>Auto Scaling ka surprise</h4><p>Ek shop ne database ko app subnet ki fixed range se allow kiya tha. Rebuild ke baad app servers naye subnet mein gaye aur sale ke din subah 09:00 baje har connection fail ho gaya. Fix ek line ka rule change tha, par seekh badi thi: unhone database group ko <code>app-sg</code> par trust karne ke liye likha, aur baad ke subnet moves non-event ban gaye.</p><p><b>Lesson:</b> identities (groups) par bharosa karo, locations (ranges) par nahi.</p></div>

<div class="iv"><p class="q">"Three-tier application ko security groups se kaise secure karoge?"</p><p>Har tier ka ek group. Web internet se 80 aur 443 allow karta hai; app web group se apna port; database app group se apna port. Koi tier wahan se traffic accept nahi karta jahan se zaroorat nahi. Batao ki references instance replacement aur subnet moves ke baad bhi chalte hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Security group doosre group ke rule ka source ban sakta hai.</li>
<li>Group references label par trust karte hain, range par nahi, isliye scaling aur subnet moves survive karte hain.</li>
<li>Typical chain: internet se web-sg se app-sg se db-sg.</li>
<li>Script karte waqt referenced group pehle banao.</li>
</ul></div>
`}};export{t as default};