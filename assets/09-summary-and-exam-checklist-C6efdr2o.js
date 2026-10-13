var e={id:`summary-and-exam-checklist`,h:{en:`Summary and exam checklist for Essential AI Knowledge`,hi:`Essential AI Knowledge ka summary aur exam checklist`},body:{en:`
<p>This domain carries 38 percent of the exam, the biggest share after infrastructure, so it rewards a calm, organised revision. Use this chapter as your last read before the quiz and again the evening before the exam. It restates the whole module in one page, gives you a checklist of statements you should be able to say aloud, and lists the traps that cost marks.</p>
<h3>The module on one page</h3>
<table class="cmp"><tr><th>Topic</th><th>The one idea to keep</th></tr>
<tr><td>AI, ML, DL</td><td>AI contains ML, ML contains deep learning; generative AI and LLMs are deep learning. ML learns rules from data.</td></tr>
<tr><td>Why AI took off</td><td>GPUs (compute), data, and algorithms with open software arrived together; cloud GPUs and pre-trained models lowered the cost.</td></tr>
<tr><td>Training versus inference</td><td>Training: throughput, big cluster, fast GPU network, checkpoints. Inference: latency and cost per answer, scalable pool, optimisation.</td></tr>
<tr><td>GPU versus CPU</td><td>GPU: thousands of simple cores, high throughput, Tensor Cores, HBM. CPU: few strong cores, low latency, runs the system and feeds data.</td></tr>
<tr><td>Life cycle and stack</td><td>Prepare, train, customise, optimise, deploy, monitor. CUDA, CUDA-X, NeMo, TensorRT, NIM/Triton/Dynamo, NGC, AI Enterprise, GPU Operator, DCGM.</td></tr>
<tr><td>Platforms</td><td>DGX turnkey; HGX board in partner servers; MGX modular; OVX graphics and digital twins; Jetson and IGX edge; Spark and Station desk-side; DGX Cloud rented.</td></tr>
<tr><td>Generative AI</td><td>LLMs predict the next token; hallucinations happen; prompting, then RAG, then fine-tuning to use private data.</td></tr>
<tr><td>Sizing</td><td>Weights memory = parameters × bytes per parameter; training needs several times the inference memory.</td></tr></table>
<h3>Say-it-aloud checklist</h3>
<p>If you cannot say each line in one or two sentences without looking, re-read the chapter named in brackets.</p>
<ul><li>I can define AI, ML, DL, generative AI and an LLM, and say which contains which. (Chapter 1)</li><li>I can name the three forces behind modern AI and give an industry example. (Chapter 2)</li><li>I can state the main metric for training and for inference. (Chapter 3)</li><li>I can explain why a GPU suits neural networks and what a Tensor Core and HBM are. (Chapter 4)</li><li>I can list the six life-cycle stages and match NeMo, TensorRT, NIM, NGC and DCGM to their jobs. (Chapter 5)</li><li>I can tell DGX from HGX and say when I would choose OVX, Jetson or DGX Cloud. (Chapter 6)</li><li>I can define token, parameter, context window and hallucination, and pick between prompting, RAG and fine-tuning. (Chapter 7)</li><li>I can estimate the weights memory of a model and say why training needs more. (Chapter 8)</li></ul>
<h3>Traps that cost marks</h3>
<table class="cmp"><tr><th>If the question says</th><th>The likely answer</th></tr>
<tr><td>broadest term</td><td>AI, not ML or DL</td></tr>
<tr><td>learns from data without hand-written rules</td><td>machine learning</td></tr>
<tr><td>many-layer neural networks</td><td>deep learning</td></tr>
<tr><td>optimise a trained model for fast inference</td><td>TensorRT</td></tr>
<tr><td>customise an LLM with company data</td><td>NeMo (fine-tuning) or RAG if the data changes</td></tr>
<tr><td>monitor GPU health in the data center</td><td>DCGM</td></tr>
<tr><td>turnkey NVIDIA-supported system</td><td>DGX</td></tr>
<tr><td>partner builds servers around NVIDIA GPUs</td><td>HGX or MGX</td></tr>
<tr><td>reduce memory so a model fits on a smaller GPU</td><td>lower precision (for example FP16 to FP8)</td></tr>
<tr><td>why GPUs are better for deep learning</td><td>massive parallelism for matrix maths, not a higher clock speed</td></tr></table>
<div class="eg"><p><b>Worked recap (made-up numbers).</b> A retailer wants a shop assistant that answers questions about 3,000 product pages. A good answer touches every chapter: the assistant is an LLM (generative AI, deep learning); product pages change daily, so use RAG, not fine-tuning, for facts; a 13-billion-parameter model in FP16 needs about 26 GB for weights, so one 40 GB-class GPU or larger fits it with working memory; the model is optimised with TensorRT and served with NIM; GPU health is watched with DCGM; the model is run on a few rented cloud GPUs first, then moved onto partner HGX servers if usage stays high.</p></div>
<div class="exam"><p><b>Last-day advice.</b> Read each question for the job being asked about (train, optimise, serve, monitor, house, size), not for the product name you recognise first. Product names change; jobs do not.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Keep the one-page table in your head; every question is a variation on it.</li><li>Match products by job: NeMo customises, TensorRT optimises, NIM serves, DCGM monitors.</li><li>Memory = parameters × bytes; lower precision saves memory.</li><li>Use the checklist, then take the quiz and re-read only the chapters where you missed a line.</li></ul></div>
`,hi:`
<p>Yeh domain exam ka 38 percent hai, infrastructure ke baad sabse bada hissa, isliye shaant aur organised revision isme inaam deta hai. Is chapter ko quiz se pehle apni aakhri padhai aur exam se ek raat pehle phir se padhne ke liye use karo. Yeh poore module ko ek page mein dohrata hai, aise statements ki checklist deta hai jo aap bol kar bata sako, aur woh traps batata hai jo marks gawate hain.</p>
<h3>Ek page par module</h3>
<table class="cmp"><tr><th>Topic</th><th>Ek idea jo yaad rakhna hai</th></tr>
<tr><td>AI, ML, DL</td><td>AI ke andar ML, ML ke andar deep learning; generative AI aur LLMs deep learning hain. ML data se rules seekhta hai.</td></tr>
<tr><td>AI kyun badha</td><td>GPUs (compute), data, aur open software ke saath algorithms saath aaye; cloud GPUs aur pre-trained models ne cost kam ki.</td></tr>
<tr><td>Training versus inference</td><td>Training: throughput, bada cluster, fast GPU network, checkpoints. Inference: latency aur cost per answer, scalable pool, optimisation.</td></tr>
<tr><td>GPU versus CPU</td><td>GPU: hazaaron simple cores, high throughput, Tensor Cores, HBM. CPU: kam strong cores, low latency, system chalata hai aur data feed karta hai.</td></tr>
<tr><td>Life cycle aur stack</td><td>Prepare, train, customise, optimise, deploy, monitor. CUDA, CUDA-X, NeMo, TensorRT, NIM/Triton/Dynamo, NGC, AI Enterprise, GPU Operator, DCGM.</td></tr>
<tr><td>Platforms</td><td>DGX turnkey; HGX partner servers mein board; MGX modular; OVX graphics aur digital twins; Jetson aur IGX edge; Spark aur Station desk-side; DGX Cloud rent par.</td></tr>
<tr><td>Generative AI</td><td>LLMs agla token predict karte hain; hallucinations hote hain; private data ke liye prompting, phir RAG, phir fine-tuning.</td></tr>
<tr><td>Sizing</td><td>Weights memory = parameters × bytes per parameter; training ko inference se kai guna zyada memory chahiye.</td></tr></table>
<h3>Bol kar batane wali checklist</h3>
<p>Agar aap har line ko bina dekhe ek-do vaakyon mein nahi bol paate, to bracket mein likha chapter dobara padho.</p>
<ul><li>Main AI, ML, DL, generative AI aur LLM define kar sakta hoon, aur bata sakta hoon kaun kiske andar hai. (Chapter 1)</li><li>Main modern AI ke peeche ki teen forces bata sakta hoon aur ek industry example de sakta hoon. (Chapter 2)</li><li>Main training aur inference ka main metric bata sakta hoon. (Chapter 3)</li><li>Main samjha sakta hoon ki GPU neural networks ke liye kyun fit hai aur Tensor Core aur HBM kya hain. (Chapter 4)</li><li>Main life-cycle ke chhe stages ginwa sakta hoon aur NeMo, TensorRT, NIM, NGC aur DCGM ko unke kaam se match kar sakta hoon. (Chapter 5)</li><li>Main DGX aur HGX mein fark bata sakta hoon aur kab OVX, Jetson ya DGX Cloud chunta hoon. (Chapter 6)</li><li>Main token, parameter, context window aur hallucination define kar sakta hoon, aur prompting, RAG aur fine-tuning mein se chun sakta hoon. (Chapter 7)</li><li>Main model ki weights memory ka andaza laga sakta hoon aur bata sakta hoon ki training ko zyada kyun chahiye. (Chapter 8)</li></ul>
<h3>Traps jo marks gawate hain</h3>
<table class="cmp"><tr><th>Agar sawal kehta hai</th><th>Sambhavit jawab</th></tr>
<tr><td>sabse broad term</td><td>AI, ML ya DL nahi</td></tr>
<tr><td>hand-written rules ke bina data se seekhta hai</td><td>machine learning</td></tr>
<tr><td>bahut layers wale neural networks</td><td>deep learning</td></tr>
<tr><td>trained model ko tez inference ke liye optimise karo</td><td>TensorRT</td></tr>
<tr><td>company data se LLM customise karo</td><td>NeMo (fine-tuning) ya RAG agar data badalta hai</td></tr>
<tr><td>data center mein GPU health monitor karo</td><td>DCGM</td></tr>
<tr><td>turnkey NVIDIA-supported system</td><td>DGX</td></tr>
<tr><td>partner NVIDIA GPUs ke aas-paas servers banata hai</td><td>HGX ya MGX</td></tr>
<tr><td>memory kam karo taaki model chhote GPU par fit ho</td><td>lower precision (jaise FP16 se FP8)</td></tr>
<tr><td>GPUs deep learning ke liye behtar kyun hain</td><td>matrix maths ke liye massive parallelism, zyada clock speed nahi</td></tr></table>
<div class="eg"><p><b>Worked recap (made-up numbers).</b> Ek retailer 3,000 product pages ke baare mein sawalon ka jawab dene wala shop assistant chahta hai. Achha jawab har chapter ko chhoota hai: assistant ek LLM hai (generative AI, deep learning); product pages roz badalte hain, isliye facts ke liye RAG, fine-tuning nahi; FP16 mein 13-billion-parameter model ko weights ke liye lagbhag 26 GB chahiye, isliye ek 40 GB-class ya bada GPU working memory ke saath use fit kar leta hai; model TensorRT se optimise aur NIM se serve hota hai; GPU health DCGM se dekhi jaati hai; model pehle kuch rent ke cloud GPUs par chalta hai, phir agar use bana rahe to partner HGX servers par le jaaya jaata hai.</p></div>
<div class="exam"><p><b>Aakhri din ki salah.</b> Har sawal ko us kaam ke liye padho jis ke baare mein poocha ja raha hai (train, optimise, serve, monitor, ghar dena, size karna), us product ke naam ke liye nahi jo aap sabse pehle pehchante ho. Product ke naam badalte hain; kaam nahi badalte.</p></div>
<div class="kt"><p><b>Key takeaways</b></p><ul><li>Ek-page table dimag mein rakho; har sawal uska ek variation hai.</li><li>Products ko kaam se match karo: NeMo customise karta hai, TensorRT optimise, NIM serve, DCGM monitor.</li><li>Memory = parameters × bytes; lower precision memory bachati hai.</li><li>Checklist use karo, phir quiz do aur sirf wahi chapters dobara padho jahan line miss hui.</li></ul></div>
`}};export{e as default};