import { Discord, Slash, SlashOption } from "discordx";
import {
  CommandInteraction,
  ApplicationCommandOptionType,
  AttachmentBuilder,
} from "discord.js";

import { mathjax } from "mathjax-full/js/mathjax.js";
import { TeX } from "mathjax-full/js/input/tex.js";
import { SVG } from "mathjax-full/js/output/svg.js";
import { AllPackages } from "mathjax-full/js/input/tex/AllPackages.js";
import { liteAdaptor } from "mathjax-full/js/adaptors/liteAdaptor.js";
import { RegisterHTMLHandler } from "mathjax-full/js/handlers/html.js";

import sharp from "sharp";

const CSS = [
  "svg a{fill:blue;stroke:blue}",
  '[data-mml-node="merror"]>g{fill:red;stroke:red}',
  '[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
  "[data-frame],[data-line]{stroke-width:70px;fill:none}",
  ".mjx-dashed{stroke-dasharray:140}",
  ".mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}",
  "use[data-c]{stroke-width:3px}",
].join("");

const adaptor = liteAdaptor();
const handler = RegisterHTMLHandler(adaptor);
const tex = new TeX({ packages: AllPackages });
const svg = new SVG({ fontCache: "local" });
const html = mathjax.document("", { InputJax: tex, OutputJax: svg });

const white = { r: 255, g: 255, b: 255 };

@Discord()
class Math {
  @Slash({ name: "math", description: "Render math using MathJax" })
  async math(
    @SlashOption({
      description: "The math prompt to convert",
      name: "query",
      required: true,
      type: ApplicationCommandOptionType.String,
    })
    input: string,
    interaction: CommandInteraction,
  ) {
    const node = html.convert(input, {
      display: false,
      em: 16,
      ex: 8,
      containerWidth: 80 * 16,
    });
    const svgOut = adaptor
      .innerHTML(node)
      .replace(/<defs>/, `<defs><style>${CSS}</style>`);
    const png = await sharp(Buffer.from(svgOut), { density: 300 })
      .extend({ top: 5, bottom: 5, left: 5, right: 5, background: white })
      .flatten({ background: white })
      .toBuffer();
    const attachment = new AttachmentBuilder(png);
    await interaction.reply({ files: [attachment] });
  }
}
