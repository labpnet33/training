var e={id:`aws-cli`,h:{en:`Driving AWS from the command line: credentials, profiles and Regions`,hi:`Command line se AWS chalana: credentials, profiles aur Regions`},body:{en:`
<p>The console is a website. Behind every click it sends an <b>API call</b> to AWS. The <b>AWS CLI</b> sends the same calls from a terminal. Why learn it? A command can be typed again, saved in a script, reviewed by a colleague and pasted into a ticket. A hundred clicks cannot. Think of the console as ordering at a counter and the CLI as handing over a written order form: the form can be photocopied.</p>

<h3>Three questions every command answers</h3>
<ol>
<li><b>Who am I?</b> (credentials: which identity signs the request)</li>
<li><b>Where?</b> (which account, and which Region)</li>
<li><b>What?</b> (service, operation and parameters, for example <code>ec2 describe-vpcs</code>)</li>
</ol>
<pre class="code"><span class="c"># Always start a session by asking who you are and where you are</span>
aws sts get-caller-identity
aws configure get region</pre>
<pre class="out"><span class="c"># Illustrative output (111122223333 is a documentation account ID)</span>
{
    "UserId": "AROAEXAMPLEID:asha",
    "Account": "<span class="hl">111122223333</span>",
    "Arn": "arn:aws:sts::111122223333:assumed-role/NKLabAdmin/asha"
}
ap-south-1</pre>

<h3>Where credentials come from</h3>
<p>The CLI looks for credentials in a fixed order and uses the first one it finds: command-line options, then environment variables (<code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, <code>AWS_SESSION_TOKEN</code>), then the files in <code>~/.aws/</code> (<code>credentials</code> and <code>config</code>), then IAM Identity Center sign-in tokens, then an instance role when the CLI runs on EC2. The same idea applies to the Region: the <code>--region</code> option wins over the environment variable <code>AWS_REGION</code> or <code>AWS_DEFAULT_REGION</code>, which wins over the <code>region</code> in your profile.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CLI settings precedence">
<text x="20" y="25" class="svg-accent" font-size="14">Highest priority at the top</text>
<rect x="20" y="40" width="600" height="38" rx="6" fill="#bae6fd"/><text x="35" y="64" class="svg-ink" font-size="13">1. Command-line options: --region ap-south-1 --profile nk-lab</text>
<rect x="20" y="86" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="35" y="110" class="svg-ink" font-size="13">2. Environment variables: AWS_PROFILE, AWS_REGION, AWS_ACCESS_KEY_ID ...</text>
<rect x="20" y="132" width="600" height="38" rx="6" fill="#fde68a"/><text x="35" y="156" class="svg-ink" font-size="13">3. Files: ~/.aws/credentials and ~/.aws/config (profile sections)</text>
<rect x="20" y="178" width="600" height="38" rx="6" fill="#e2e8f0"/><text x="35" y="202" class="svg-ink" font-size="13">4. Container / instance role (CloudShell, EC2): temporary credentials</text>
</svg><p class="cap">When two settings disagree, the higher one wins. This explains most "it works on my laptop" surprises.</p></div>

<h3>Three safe ways to get started</h3>
<dl class="terms">
<dt>AWS CloudShell</dt><dd>A browser shell opened from the console. It is already signed in as you, the CLI is installed and no key is stored on your laptop. It is available in the Mumbai Region (check the Region list in the console). Ideal for these labs. Files in your home directory persist for that Region, with a storage limit.</dd>
<dt>IAM Identity Center (recommended on a laptop)</dt><dd>You sign in through a browser and the CLI receives short-lived credentials. Run <code>aws configure sso</code> once, then <code>aws sso login --profile nk-lab</code> each day.</dd>
<dt>IAM user access keys (only if you must)</dt><dd>A long-lived key pair. Create it for an IAM user with MFA and minimum permissions, rotate it, and never paste it into code or a screenshot.</dd>
</dl>
<pre class="code"><span class="c"># One-time setup of a named profile with Identity Center (prompts you for values)</span>
aws configure sso
<span class="c"># Daily sign-in, then use the profile</span>
aws sso login --profile nk-lab
aws sts get-caller-identity --profile nk-lab

<span class="c"># Static keys, only for a lab IAM user (values here are AWS documentation examples)</span>
aws configure set aws_access_key_id AKIAIOSFODNN7EXAMPLE
aws configure set aws_secret_access_key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
aws configure set region ap-south-1
aws configure list</pre>
<p>That last block is exactly what you practise in the in-app emulator lab "Connect the CLI and build your first VPC". On your real account, never type a real secret into a shared screen or save it in a file you commit to Git.</p>

<h3>Useful settings</h3>
<ul>
<li><code>export AWS_PROFILE=nk-lab</code> makes a profile the default for the shell session.</li>
<li><code>export AWS_REGION=ap-south-1</code> sets the Region for one session.</li>
<li><code>aws configure list</code> shows which source each setting came from, which is the fastest way to debug a precedence surprise.</li>
<li><code>aws help</code>, <code>aws ec2 help</code> and <code>aws ec2 create-vpc help</code> are the built-in manual pages.</li>
<li><code>--dry-run</code> on many EC2 commands checks permission without creating anything.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ravi runs <code>aws ec2 describe-vpcs</code> and sees nothing, though he built a VPC yesterday. He runs <code>aws configure list</code>. The Region line says <code>us-east-1</code>, source <code>env</code>, because his terminal exports <code>AWS_REGION</code> from an old tutorial. He runs <code>unset AWS_REGION</code>, the profile region <code>ap-south-1</code> applies, and the VPC appears. One line of diagnosis, no guessing.</p></div>

<div class="warn"><p><b>Common mistake.</b> Committing the file <code>~/.aws/credentials</code> or a script with a key to a public Git repository. Bots scan Git hosts for keys within minutes and spin up crypto-miners on your bill. Use Identity Center or CloudShell and keep keys out of code.</p></div>

<div class="exam"><p><b>Exam trap.</b> Applications on EC2 should use an <b>instance profile (IAM role)</b>, not stored access keys. The command <code>aws sts get-caller-identity</code> needs no special permission and always works if credentials are valid. "Unable to locate credentials" and "You must specify a region" are different errors with different fixes.</p></div>

<div class="scn"><h4>Keys in the repository</h4><p>A trainee pushed a lab script to a public repository with an access key inside. Within an hour an alert reported 40 instances launched in Regions he had never used. AWS support helped him deactivate the key, delete the instances and file for a billing review. The cost was a stressful weekend.</p><p><b>Lesson:</b> use short-lived credentials, never hard-code keys, and turn on a budget alert so that abuse is noticed quickly.</p></div>

<div class="iv"><p class="q">"How does the AWS CLI decide which credentials and Region to use?"</p><p>Explain the precedence: command-line options, environment variables, profile files, then role-based credentials. Mention <code>aws configure list</code> and <code>aws sts get-caller-identity</code> as the debugging tools, and that roles and Identity Center are preferred over static keys.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>The console and the CLI are two front ends to the same API.</li>
<li>Always check identity and Region first: <code>aws sts get-caller-identity</code> and <code>aws configure get region</code>.</li>
<li>Settings follow a precedence order; <code>aws configure list</code> shows the source.</li>
<li>Prefer CloudShell or Identity Center; keep long-lived keys out of code.</li>
<li>Use <code>--dry-run</code> and <code>help</code> to learn safely.</li>
</ul></div>
`,hi:`
<p>Console ek website hai. Har click ke peeche woh AWS ko ek <b>API call</b> bhejta hai. <b>AWS CLI</b> wahi calls terminal se bhejta hai. Seekhna kyun? Ek command dobara type ho sakti hai, script mein save ho sakti hai, colleague review kar sakta hai aur ticket mein paste ho sakti hai. Sau clicks nahi ho sakte. Console ko counter par order dena samjho aur CLI ko likha hua order form: form ki photocopy ho sakti hai.</p>

<h3>Har command teen sawaalon ka jawab deti hai</h3>
<ol>
<li><b>Main kaun hoon?</b> (credentials: kaun si identity request sign karti hai)</li>
<li><b>Kahan?</b> (kaunsa account, aur kaunsa Region)</li>
<li><b>Kya?</b> (service, operation aur parameters, jaise <code>ec2 describe-vpcs</code>)</li>
</ol>
<pre class="code"><span class="c"># Har session ki shuruaat poochh kar karo ki aap kaun ho aur kahan ho</span>
aws sts get-caller-identity
aws configure get region</pre>
<pre class="out"><span class="c"># Illustrative output (111122223333 ek documentation account ID hai)</span>
{
    "UserId": "AROAEXAMPLEID:asha",
    "Account": "<span class="hl">111122223333</span>",
    "Arn": "arn:aws:sts::111122223333:assumed-role/NKLabAdmin/asha"
}
ap-south-1</pre>

<h3>Credentials kahan se aate hain</h3>
<p>CLI credentials ek fixed order mein dhundta hai aur pehle mile hue ko use karta hai: command-line options, phir environment variables (<code>AWS_ACCESS_KEY_ID</code>, <code>AWS_SECRET_ACCESS_KEY</code>, <code>AWS_SESSION_TOKEN</code>), phir <code>~/.aws/</code> ki files (<code>credentials</code> aur <code>config</code>), phir IAM Identity Center sign-in tokens, aur EC2 par chal raha ho to instance role. Region ke liye bhi yahi idea hai: <code>--region</code> option, environment variable <code>AWS_REGION</code> ya <code>AWS_DEFAULT_REGION</code> se upar hai, jo profile ke <code>region</code> se upar hai.</p>

<div class="dia"><svg viewBox="0 0 640 230" role="img" aria-label="CLI settings ki precedence">
<text x="20" y="25" class="svg-accent" font-size="14">Sabse upar sabse zyada priority</text>
<rect x="20" y="40" width="600" height="38" rx="6" fill="#bae6fd"/><text x="35" y="64" class="svg-ink" font-size="13">1. Command-line options: --region ap-south-1 --profile nk-lab</text>
<rect x="20" y="86" width="600" height="38" rx="6" fill="#bbf7d0"/><text x="35" y="110" class="svg-ink" font-size="13">2. Environment variables: AWS_PROFILE, AWS_REGION, AWS_ACCESS_KEY_ID ...</text>
<rect x="20" y="132" width="600" height="38" rx="6" fill="#fde68a"/><text x="35" y="156" class="svg-ink" font-size="13">3. Files: ~/.aws/credentials aur ~/.aws/config (profile sections)</text>
<rect x="20" y="178" width="600" height="38" rx="6" fill="#e2e8f0"/><text x="35" y="202" class="svg-ink" font-size="13">4. Container / instance role (CloudShell, EC2): temporary credentials</text>
</svg><p class="cap">Do settings alag hon to upar wali jeetti hai. Zyadatar "mere laptop par chalta hai" surprises isi se samajh aate hain.</p></div>

<h3>Shuru karne ke teen safe tareeke</h3>
<dl class="terms">
<dt>AWS CloudShell</dt><dd>Console se khulne wala browser shell. Yeh pehle se aapke naam se signed in hota hai, CLI installed hota hai aur laptop par koi key store nahi hoti. Mumbai Region mein available hai (console mein Region list check karo). In labs ke liye ideal. Home directory ki files us Region mein persist karti hain, storage limit ke saath.</dd>
<dt>IAM Identity Center (laptop par recommended)</dt><dd>Aap browser se sign in karte ho aur CLI ko short-lived credentials milte hain. Ek baar <code>aws configure sso</code> chalao, phir roz <code>aws sso login --profile nk-lab</code>.</dd>
<dt>IAM user access keys (sirf jab zaroori ho)</dt><dd>Long-lived key pair. Isse MFA aur minimum permissions wale IAM user ke liye banao, rotate karo, aur code ya screenshot mein kabhi paste mat karo.</dd>
</dl>
<pre class="code"><span class="c"># Identity Center ke saath named profile ka one-time setup (values poochta hai)</span>
aws configure sso
<span class="c"># Roz ka sign-in, phir profile use karo</span>
aws sso login --profile nk-lab
aws sts get-caller-identity --profile nk-lab

<span class="c"># Static keys, sirf lab IAM user ke liye (values AWS documentation ke examples hain)</span>
aws configure set aws_access_key_id AKIAIOSFODNN7EXAMPLE
aws configure set aws_secret_access_key wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
aws configure set region ap-south-1
aws configure list</pre>
<p>Aakhri block bilkul wahi hai jo aap in-app emulator lab "Connect the CLI and build your first VPC" mein practise karte ho. Real account par kisi shared screen par real secret type mat karo aur use Git mein commit hone wali file mein save mat karo.</p>

<h3>Kaam ki settings</h3>
<ul>
<li><code>export AWS_PROFILE=nk-lab</code> shell session ke liye profile ko default banata hai.</li>
<li><code>export AWS_REGION=ap-south-1</code> ek session ke liye Region set karta hai.</li>
<li><code>aws configure list</code> dikhata hai ki har setting kahan se aayi, jo precedence ke surprise debug karne ka sabse tez tareeka hai.</li>
<li><code>aws help</code>, <code>aws ec2 help</code> aur <code>aws ec2 create-vpc help</code> built-in manual pages hain.</li>
<li>Kai EC2 commands par <code>--dry-run</code> kuch banaye bina permission check karta hai.</li>
</ul>

<div class="eg"><p><b>Worked example.</b> Ravi <code>aws ec2 describe-vpcs</code> chalata hai aur kuch nahi dikhta, jabki usne kal VPC banaya tha. Woh <code>aws configure list</code> chalata hai. Region line <code>us-east-1</code> dikhati hai, source <code>env</code>, kyunki uska terminal ek purane tutorial se <code>AWS_REGION</code> export karta hai. Woh <code>unset AWS_REGION</code> chalata hai, profile ka region <code>ap-south-1</code> lagu hota hai, aur VPC dikhne lagta hai. Diagnosis ek line mein, andaaza nahi.</p></div>

<div class="warn"><p><b>Common mistake.</b> File <code>~/.aws/credentials</code> ya key wali script ko public Git repository mein commit kar dena. Bots Git hosts ko minutes mein scan karke keys dhundhte hain aur aapke bill par crypto-miners chala dete hain. Identity Center ya CloudShell use karo aur keys ko code se door rakho.</p></div>

<div class="exam"><p><b>Exam trap.</b> EC2 par chalne wali applications ko stored access keys nahi, <b>instance profile (IAM role)</b> use karna chahiye. <code>aws sts get-caller-identity</code> ko koi special permission nahi chahiye aur credentials valid ho to hamesha chalta hai. "Unable to locate credentials" aur "You must specify a region" alag errors hain jinke fix alag hain.</p></div>

<div class="scn"><h4>Repository mein keys</h4><p>Ek trainee ne lab script public repository mein push ki jisme access key thi. Ek ghante ke andar alert aaya ki un Regions mein 40 instances launch hue jinhe usne kabhi use nahi kiya tha. AWS support ne key deactivate karne, instances delete karne aur billing review file karne mein madad ki. Kimat ek tension bhara weekend thi.</p><p><b>Lesson:</b> short-lived credentials use karo, keys hard-code mat karo, aur budget alert lagao taaki abuse jaldi pakda jaye.</p></div>

<div class="iv"><p class="q">"AWS CLI kaise tay karta hai ki kaunse credentials aur Region use karne hain?"</p><p>Precedence samjhao: command-line options, environment variables, profile files, phir role-based credentials. Debugging tools ke roop mein <code>aws configure list</code> aur <code>aws sts get-caller-identity</code> batao, aur yeh ki roles aur Identity Center static keys se behtar hain.</p></div>

<div class="kt"><p><b>Key takeaways</b></p><ul>
<li>Console aur CLI ek hi API ke do front ends hain.</li>
<li>Hamesha pehle identity aur Region check karo: <code>aws sts get-caller-identity</code> aur <code>aws configure get region</code>.</li>
<li>Settings precedence order follow karti hain; <code>aws configure list</code> source dikhata hai.</li>
<li>CloudShell ya Identity Center prefer karo; long-lived keys ko code se door rakho.</li>
<li>Safely seekhne ke liye <code>--dry-run</code> aur <code>help</code> use karo.</li>
</ul></div>
`}};export{e as default};